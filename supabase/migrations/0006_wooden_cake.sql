/*
  # Fix schema constraints for projects table

  1. Changes
    - Make next_backup_at nullable in projects table
    - Move backup scheduling to project_settings table
    - Update create_project function to handle scheduling properly

  2. Security
    - No changes to RLS policies
*/

-- Remove not-null constraint from projects.next_backup_at
ALTER TABLE projects 
ALTER COLUMN next_backup_at DROP NOT NULL;

-- Update create_project function to handle scheduling properly
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
    total_rows,
    status,
    created_by
  ) VALUES (
    p_app_url,
    p_server_region,
    p_timezone,
    p_data_types_count,
    0,
    'active',
    auth.uid()
  )
  RETURNING * INTO v_project;

  -- Create project settings with backup schedule
  INSERT INTO project_settings (
    project_id,
    backup_schedule,
    backup_hour,
    backup_minute,
    next_backup_at
  ) VALUES (
    v_project.id,
    p_backup_schedule,
    2, -- 2 AM
    0, -- 0 minutes
    v_next_backup
  );

  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;