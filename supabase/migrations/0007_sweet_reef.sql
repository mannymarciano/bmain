/*
  # Initial Schema Setup for Bubble.io Data Manager

  1. Tables
    - projects: Main project configuration
    - project_settings: Project backup settings and schedules
    - backups: Backup history and metadata

  2. Functions
    - calculate_next_backup: Determines next backup time based on schedule
    - create_project: Creates a new project with settings

  3. Security
    - RLS policies for all tables
    - Storage bucket policies for backup files
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create project_settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects NOT NULL,
  backup_schedule text NOT NULL DEFAULT 'daily'
    CHECK (backup_schedule IN ('daily', 'weekly', 'monthly')),
  backup_hour integer NOT NULL DEFAULT 2
    CHECK (backup_hour >= 0 AND backup_hour < 24),
  backup_minute integer NOT NULL DEFAULT 0
    CHECK (backup_minute >= 0 AND backup_minute < 60),
  last_backup_at timestamptz,
  next_backup_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  schedule_type text NOT NULL
    CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  expires_at timestamptz NOT NULL,
  size_bytes bigint DEFAULT 0,
  record_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('backups', 'backups')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage their project settings"
  ON project_settings FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE created_by = auth.uid()));

CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

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
      -- Already set correctly for daily
      NULL;
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

-- Project Creation Function
CREATE OR REPLACE FUNCTION create_project(
  p_app_url text,
  p_server_region text,
  p_timezone text,
  p_data_types_count integer,
  p_backup_schedule text
) RETURNS projects AS $$
DECLARE
  v_project projects;
  v_next_backup timestamptz;
BEGIN
  -- Calculate next backup time
  v_next_backup := calculate_next_backup(
    p_backup_schedule,
    p_timezone,
    2, -- 2 AM
    0  -- 0 minutes
  );

  -- Create project
  INSERT INTO projects (
    app_url,
    server_region,
    timezone,
    data_types_count,
    status
  ) VALUES (
    p_app_url,
    p_server_region,
    p_timezone,
    p_data_types_count,
    'active'
  )
  RETURNING * INTO v_project;

  -- Create project settings
  INSERT INTO project_settings (
    project_id,
    backup_schedule,
    next_backup_at
  ) VALUES (
    v_project.id,
    p_backup_schedule,
    v_next_backup
  );

  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;