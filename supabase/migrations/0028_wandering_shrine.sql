/*
  # Fix Database Schema and Relationships

  1. Changes
    - Drop and recreate tables with proper relationships
    - Add proper RLS policies
    - Fix project settings relationship
    - Add proper indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add comprehensive security policies
*/

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS project_settings CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;

-- Create project_status enum
CREATE TYPE project_status AS ENUM ('active', 'paused');

-- Create projects table
CREATE TABLE projects (
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
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_app_url CHECK (app_url ~ '^https?://.*bubbleapps\.io')
);

-- Create project_settings table
CREATE TABLE project_settings (
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

-- Add performance indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_settings_project_id ON project_settings(project_id);
CREATE INDEX idx_project_settings_next_backup ON project_settings(next_backup_at) 
WHERE backup_enabled = true;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Project Settings RLS policies
CREATE POLICY "Users can view their project settings"
  ON project_settings FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create project settings"
  ON project_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update project settings"
  ON project_settings FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE created_by = auth.uid()
    )
  );

-- Add updated_at triggers
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

CREATE TRIGGER update_project_settings_updated_at
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle project creation with settings
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

  -- Create project
  INSERT INTO projects (
    app_url,
    server_region,
    timezone,
    data_types,
    api_key,
    data_types_count,
    status,
    backup_enabled,
    created_by
  ) VALUES (
    p_app_url,
    p_server_region,
    p_timezone,
    p_data_types,
    p_api_key,
    array_length(p_data_types, 1),
    'active'::project_status,
    true,
    auth.uid()
  )
  RETURNING * INTO v_project;

  -- Create project settings
  INSERT INTO project_settings (
    project_id,
    backup_schedule,
    backup_hour,
    backup_minute,
    next_backup_at,
    backup_enabled
  ) VALUES (
    v_project.id,
    p_backup_schedule,
    2,
    0,
    v_next_backup,
    true
  );

  RETURN v_project;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Failed to create project: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;