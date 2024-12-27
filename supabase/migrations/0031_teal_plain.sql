/*
  # Fix Backup Issues

  1. Schema Updates
    - Fix backups table structure
    - Add missing columns
    - Update policies
    - Fix triggers

  2. Changes
    - Add updated_at column with proper default
    - Fix policy conflicts
    - Add proper indexes
    - Add error handling columns
*/

-- Drop existing policies to avoid conflicts
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

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_backups_updated_at ON backups;

-- Recreate backups table with proper structure
CREATE TABLE IF NOT EXISTS backups_new (
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

-- Copy data if old table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'backups') THEN
    INSERT INTO backups_new (
      id, project_id, file_path, status, schedule_type, size_bytes, 
      record_count, retry_count, next_retry_at, error_details, expires_at, 
      created_by, created_at, updated_at
    )
    SELECT 
      id, project_id, file_path, status, schedule_type, size_bytes,
      record_count, 0, NULL, NULL, expires_at,
      created_by, created_at, COALESCE(updated_at, now())
    FROM backups;
  END IF;
END $$;

-- Drop old table and rename new one
DROP TABLE IF EXISTS backups CASCADE;
ALTER TABLE backups_new RENAME TO backups;

-- Add performance indexes
CREATE INDEX idx_backups_project_id ON backups(project_id);
CREATE INDEX idx_backups_status ON backups(status);
CREATE INDEX idx_backups_created_by ON backups(created_by);
CREATE INDEX idx_backups_expires_at ON backups(expires_at);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Create backup policies
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

-- Create updated_at trigger
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

-- Add backup cleanup function
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