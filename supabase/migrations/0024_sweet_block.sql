/*
  # Fix project status handling

  1. Changes
    - Ensure proper status column exists
    - Add proper type constraints
    - Update function signatures
  
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure we have our enum type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('active', 'paused');
  END IF;
END $$;

-- Safely handle the status column
DO $$ 
BEGIN
  -- Create a temporary text column for the migration
  ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS status_temp text;

  -- Copy existing status values if they exist
  UPDATE projects 
  SET status_temp = status::text 
  WHERE status IS NOT NULL;

  -- Drop the existing status column
  ALTER TABLE projects 
  DROP COLUMN IF EXISTS status;

  -- Create the new status column with enum type
  ALTER TABLE projects 
  ADD COLUMN status project_status NOT NULL DEFAULT 'active'::project_status;

  -- Migrate data from temporary column
  UPDATE projects 
  SET status = CASE 
    WHEN status_temp = 'active' THEN 'active'::project_status
    WHEN status_temp = 'paused' THEN 'paused'::project_status
    ELSE 'active'::project_status
  END
  WHERE status_temp IS NOT NULL;

  -- Drop temporary column
  ALTER TABLE projects 
  DROP COLUMN IF EXISTS status_temp;
END $$;

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