/*
  # Final Database Structure Fixes

  1. Changes
    - Fix updated_at handling
    - Add missing columns
    - Update RLS policies
    - Fix enum type issues

  2. Security
    - Strengthen RLS policies
    - Add proper cascading
*/

-- Recreate the project_status enum if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('active', 'paused');
  END IF;
END $$;

-- Update projects table
ALTER TABLE projects
ALTER COLUMN status TYPE text,
ADD COLUMN IF NOT EXISTS backup_enabled boolean NOT NULL DEFAULT true;

-- Update project status to use text
UPDATE projects 
SET status = CASE 
  WHEN status::text = 'active' THEN 'active'
  WHEN status::text = 'paused' THEN 'paused'
  ELSE 'active'
END;

-- Update backups table
ALTER TABLE backups
ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
ADD COLUMN IF NOT EXISTS error_details jsonb,
ALTER COLUMN updated_at SET DEFAULT now();

-- Fix project settings
ALTER TABLE project_settings
ADD COLUMN IF NOT EXISTS backup_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_backup_status text,
ADD COLUMN IF NOT EXISTS last_backup_error text,
ALTER COLUMN updated_at SET DEFAULT now();

-- Update RLS policies
CREATE OR REPLACE FUNCTION check_project_access(project_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_id
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update project settings policies
DROP POLICY IF EXISTS "Users can view their project settings" ON project_settings;
DROP POLICY IF EXISTS "Users can update their project settings" ON project_settings;

CREATE POLICY "Users can view their project settings"
  ON project_settings FOR SELECT
  TO authenticated
  USING (check_project_access(project_id));

CREATE POLICY "Users can update their project settings"
  ON project_settings FOR UPDATE
  TO authenticated
  USING (check_project_access(project_id))
  WITH CHECK (check_project_access(project_id));

-- Update backup policies
DROP POLICY IF EXISTS "Users can view backups for their projects" ON backups;
DROP POLICY IF EXISTS "Users can create backups for their projects" ON backups;
DROP POLICY IF EXISTS "Users can update their project backups" ON backups;

CREATE POLICY "Users can view backups for their projects"
  ON backups FOR SELECT
  TO authenticated
  USING (check_project_access(project_id));

CREATE POLICY "Users can create backups for their projects"
  ON backups FOR INSERT
  TO authenticated
  WITH CHECK (check_project_access(project_id));

CREATE POLICY "Users can update their project backups"
  ON backups FOR UPDATE
  TO authenticated
  USING (check_project_access(project_id))
  WITH CHECK (check_project_access(project_id));

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_backups_project_status 
ON backups(project_id, status);

CREATE INDEX IF NOT EXISTS idx_project_settings_project_enabled 
ON project_settings(project_id, backup_enabled) 
WHERE backup_enabled = true;

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_project_settings_updated_at ON project_settings;
DROP TRIGGER IF EXISTS update_backups_updated_at ON backups;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_settings_updated_at
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_backups_updated_at
  BEFORE UPDATE ON backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();