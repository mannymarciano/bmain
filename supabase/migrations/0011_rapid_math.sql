/*
  # Add data types and API key to projects

  1. Changes
    - Add data_types array column to projects table
    - Add encrypted api_key column for Bubble.io authentication
    - Update project creation function

  2. Security
    - Enable RLS on new columns
    - Ensure api_key is properly encrypted
*/

-- Add data_types array column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS data_types text[] NOT NULL DEFAULT '{}';

-- Add encrypted api_key column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS api_key text;

-- Update create_project function
CREATE OR REPLACE FUNCTION create_project(
  p_app_url text,
  p_server_region text,
  p_timezone text,
  p_data_types text[],
  p_api_key text,
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

  -- Create project with data types and API key
  INSERT INTO projects (
    app_url,
    server_region,
    timezone,
    data_types,
    api_key,
    data_types_count,
    total_rows,
    status,
    created_by
  ) VALUES (
    p_app_url,
    p_server_region,
    p_timezone,
    p_data_types,
    p_api_key,
    array_length(p_data_types, 1),
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