/*
  # Fix Project Schema and Policies

  1. Changes
    - Safely handle existing policies
    - Add missing extensions
    - Update project schema
    - Add backup scheduling functions

  2. Security
    - Update RLS policies with proper checks
*/

-- Enable extensions (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can manage their project settings" ON project_settings;
  DROP POLICY IF EXISTS "Users can view their own backups" ON backups;
  DROP POLICY IF EXISTS "Users can create their own backups" ON backups;
  DROP POLICY IF EXISTS "Users can read their own backup files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own backup files" ON storage.objects;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create or update tables
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_url text NOT NULL,
  server_region text NOT NULL,
  timezone text NOT NULL,
  data_types_count integer NOT NULL DEFAULT 0,
  total_rows integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Storage bucket (if not exists)
INSERT INTO storage.buckets (id, name)
VALUES ('backups', 'backups')
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can read their own backup files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'backups' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own backup files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'backups' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Helper Functions
CREATE OR REPLACE FUNCTION calculate_next_backup(
  p_schedule text,
  p_timezone text,
  p_hour integer,
  p_minute integer
) RETURNS timestamptz AS $$
DECLARE
  next_backup timestamptz;
BEGIN
  -- Set initial next backup time to today at specified hour/minute in project timezone
  next_backup := (NOW() AT TIME ZONE p_timezone)::date + 
                 make_time(p_hour, p_minute, 0);
  
  -- Adjust to project timezone
  next_backup := next_backup AT TIME ZONE p_timezone;
  
  -- If this time has already passed today, start from tomorrow
  IF next_backup <= NOW() THEN
    next_backup := next_backup + '1 day'::interval;
  END IF;
  
  -- Adjust based on schedule type
  CASE p_schedule
    WHEN 'daily' THEN
      NULL; -- Already set correctly for daily
    WHEN 'weekly' THEN
      -- Move to next Monday if not already Monday
      WHILE EXTRACT(DOW FROM next_backup) != 1 LOOP
        next_backup := next_backup + '1 day'::interval;
      END LOOP;
    WHEN 'monthly' THEN
      -- Move to 1st of next month if not already
      IF EXTRACT(DAY FROM next_backup) != 1 THEN
        next_backup := DATE_TRUNC('month', next_backup + '1 month'::interval) +
                      make_time(p_hour, p_minute, 0);
      END IF;
  END CASE;
  
  RETURN next_backup;
END;
$$ LANGUAGE plpgsql;