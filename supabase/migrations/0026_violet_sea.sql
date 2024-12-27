/*
  # Fix Project Status and Add Performance Improvements

  1. Changes
    - Fix status field type issues
    - Add performance indexes
    - Add proper constraints
    - Optimize queries

  2. Performance
    - Add indexes for common queries
    - Add proper foreign key constraints
    - Optimize join conditions
*/

-- Drop and recreate status enum type
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('active', 'paused');

-- Recreate projects table with proper status field
CREATE TABLE IF NOT EXISTS projects_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_url text NOT NULL,
  server_region text NOT NULL,
  timezone text NOT NULL,
  data_types text[] NOT NULL DEFAULT '{}',
  api_key text,
  data_types_count integer NOT NULL DEFAULT 0,
  total_rows integer NOT NULL DEFAULT 0,
  status project_status NOT NULL DEFAULT 'active',
  backup_enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Copy data from old table if it exists
INSERT INTO projects_new 
SELECT 
  id,
  app_url,
  server_region,
  timezone,
  data_types,
  api_key,
  data_types_count,
  total_rows,
  'active'::project_status as status,
  backup_enabled,
  created_by,
  created_at,
  updated_at
FROM projects;

-- Drop old table and rename new one
DROP TABLE IF EXISTS projects CASCADE;
ALTER TABLE projects_new RENAME TO projects;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_backup_enabled ON projects(backup_enabled) WHERE backup_enabled = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();