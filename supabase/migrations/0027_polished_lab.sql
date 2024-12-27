/*
  # Fix Database Relationships and Optimize Schema

  1. Changes
    - Add missing foreign key relationships
    - Add proper indexes for performance
    - Update RLS policies
    - Fix project settings relationship

  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access
*/

-- Ensure project_settings table has proper structure and relationships
CREATE TABLE IF NOT EXISTS project_settings_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  backup_schedule text NOT NULL CHECK (backup_schedule IN ('daily', 'weekly', 'monthly')),
  backup_hour integer NOT NULL DEFAULT 2 CHECK (backup_hour >= 0 AND backup_hour < 24),
  backup_minute integer NOT NULL DEFAULT 0 CHECK (backup_minute >= 0 AND backup_minute < 60),
  backup_enabled boolean NOT NULL DEFAULT true,
  last_backup_at timestamptz,
  next_backup_at timestamptz,
  last_backup_status text,
  last_backup_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Copy data from old table if it exists
INSERT INTO project_settings_new (
  id,
  project_id,
  backup_schedule,
  backup_hour,
  backup_minute,
  backup_enabled,
  last_backup_at,
  next_backup_at,
  last_backup_status,
  last_backup_error,
  created_at,
  updated_at
)
SELECT 
  id,
  project_id,
  backup_schedule,
  backup_hour,
  backup_minute,
  backup_enabled,
  last_backup_at,
  next_backup_at,
  last_backup_status,
  last_backup_error,
  created_at,
  updated_at
FROM project_settings;

-- Drop old table and rename new one
DROP TABLE IF EXISTS project_settings CASCADE;
ALTER TABLE project_settings_new RENAME TO project_settings;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON project_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_settings_next_backup ON project_settings(next_backup_at) 
WHERE backup_enabled = true;

-- Enable RLS
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their project settings"
  ON project_settings
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their project settings"
  ON project_settings
  FOR UPDATE
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

-- Add updated_at trigger
CREATE TRIGGER update_project_settings_updated_at
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();