/*
  # Add project settings and schedule

  1. New Tables
    - `project_settings`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `backup_hour` (integer, 0-23)
      - `backup_minute` (integer, 0-59)
      - `last_backup_at` (timestamptz)
      - `next_backup_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_settings` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS project_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects NOT NULL,
  backup_hour integer NOT NULL DEFAULT 2,
  backup_minute integer NOT NULL DEFAULT 0,
  last_backup_at timestamptz,
  next_backup_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_hour CHECK (backup_hour >= 0 AND backup_hour < 24),
  CONSTRAINT valid_minute CHECK (backup_minute >= 0 AND backup_minute < 60)
);

ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project settings"
  ON project_settings
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Function to calculate next backup time based on schedule type and timezone
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