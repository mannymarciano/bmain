/*
  # Database Structure Update

  1. Changes
    - Drop existing policies
    - Update backups table structure
    - Add proper indexes
    - Fix storage policies

  2. Security
    - Update RLS policies
    - Add proper cascading
*/

-- Drop existing policies first
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view backups for their projects" ON backups;
  DROP POLICY IF EXISTS "Users can create backups for their projects" ON backups;
  DROP POLICY IF EXISTS "Users can update their project backups" ON backups;
  DROP POLICY IF EXISTS "Users can read their own backup files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own backup files" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_backups_updated_at ON backups;

-- Create backups table with proper structure
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  schedule_type text NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'manual')),
  size_bytes bigint DEFAULT 0,
  record_count integer DEFAULT 0,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  error_details jsonb,
  expires_at timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_backups_project_id ON backups(project_id);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created_by ON backups(created_by);
CREATE INDEX IF NOT EXISTS idx_backups_expires_at ON backups(expires_at);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Create comprehensive backup policies
CREATE POLICY "Users can view backups for their projects"
  ON backups FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create backups for their projects"
  ON backups FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their project backups"
  ON backups FOR UPDATE
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

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_backups_updated_at
  BEFORE UPDATE ON backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update storage policies
CREATE POLICY "Users can read their own backup files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'backups' AND
    EXISTS (
      SELECT 1 FROM backups b
      JOIN projects p ON b.project_id = p.id
      WHERE b.file_path = name
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own backup files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'backups' AND
    EXISTS (
      SELECT 1 FROM backups b
      JOIN projects p ON b.project_id = p.id
      WHERE b.file_path = name
      AND p.created_by = auth.uid()
    )
  );

-- Add function to handle backup cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS void AS $$
BEGIN
  -- Delete expired backups
  DELETE FROM backups
  WHERE expires_at < NOW();
  
  -- Delete orphaned files
  DELETE FROM storage.objects
  WHERE bucket_id = 'backups'
  AND NOT EXISTS (
    SELECT 1 FROM backups
    WHERE file_path = name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;