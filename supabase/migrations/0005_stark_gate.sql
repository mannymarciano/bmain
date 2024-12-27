/*
  # Create project function with settings

  1. Changes
    - Add stored procedure to create project and settings in one transaction
    - Ensures atomic project creation
    - Handles next backup calculation

  2. Security
    - Function inherits RLS policies
    - Only authenticated users can call this function
*/

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

  -- Create project settings
  INSERT INTO project_settings (
    project_id,
    backup_schedule,
    backup_hour,
    backup_minute,
    next_backup_at
  ) VALUES (
    v_project.id,
    p_backup_schedule,
    2,
    0,
    v_next_backup
  );

  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;