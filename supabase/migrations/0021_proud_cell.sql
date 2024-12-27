/*
  # Fix project status handling

  1. Changes
    - Add project_status enum type
    - Update projects table to use enum
    - Update create_project function
    - Add proper status handling
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper type safety
*/

-- Create project_status enum if it doesn't exist
DO $$ 
BEGIN
  CREATE TYPE project_status AS ENUM ('active', 'paused');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add temporary column for status conversion
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status_new project_status;

-- Update the new column with converted values
UPDATE projects 
SET status_new = CASE 
  WHEN status = 'active' THEN 'active'::project_status
  WHEN status = 'paused' THEN 'paused'::project_status
  ELSE 'active'::project_status
END;

-- Drop old column
ALTER TABLE projects 
DROP COLUMN IF EXISTS status;

-- Set not null and default for new column
ALTER TABLE projects 
ALTER COLUMN status_new SET NOT NULL,
ALTER COLUMN status_new SET DEFAULT 'active'::project_status;

-- Rename new column to status (as separate statement)
ALTER TABLE projects 
RENAME COLUMN status_new TO status;

-- Update create_project function with proper status handling
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
  -- Input validation
  IF p_app_url IS NULL OR p_server_region IS NULL OR p_timezone IS NULL THEN
    RAISE EXCEPTION 'Required parameters cannot be null';
  END IF;

  -- Calculate next backup time
  v_next_backup := calculate_next_backup(
    p_backup_schedule,
    p_timezone,
    2, -- 2 AM
    0  -- 0 minutes
  );

  -- Create project with proper status handling
  INSERT INTO projects (
    app_url,
    server_region,
    timezone,
    data_types,
    api_key,
    data_types_count,
    total_rows,
    status,
    backup_enabled,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_app_url,
    p_server_region,
    p_timezone,
    p_data_types,
    p_api_key,
    array_length(p_data_types, 1),
    0,
    'active'::project_status,
    true,
    auth.uid(),
    now(),
    now()
  )
  RETURNING * INTO v_project;

  -- Create project settings
  INSERT INTO project_settings (
    project_id,
    backup_schedule,
    backup_hour,
    backup_minute,
    next_backup_at,
    backup_enabled,
    created_at,
    updated_at
  ) VALUES (
    v_project.id,
    p_backup_schedule,
    2,
    0,
    v_next_backup,
    true,
    now(),
    now()
  );

  RETURN v_project;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Failed to create project: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;