/*
  # Fix Backup System

  1. Schema Updates
    - Fix backups table structure
    - Add proper triggers
    - Update policies
    - Add error handling

  2. Changes
    - Recreate backups table with proper columns
    - Add proper indexes
    - Fix storage policies
*/

-- Drop existing objects to avoid conflicts
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_backups_updated_at ON backups;
  DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate backups table
DROP TABLE IF EXISTS backups CASCADE;

CREATE TABLE backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  schedule_type text NOT NULL 
    CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'manual')),
  size_bytes bigint DEFAULT 0,
  record_count integer DEFAULT 0,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  error_details jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_backups_project_id ON backups(project_id);
CREATE INDEX idx_backups_status ON backups(status);
CREATE INDEX idx_backups_created_by ON backups(created_by);
CREATE INDEX idx_backups_expires_at ON backups(expires_at);
CREATE INDEX idx_backups_schedule ON backups(schedule_type, next_retry_at)
  WHERE status = 'pending';

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

-- Add updated_at trigger
CREATE TRIGGER update_backups_updated_at
  BEFORE UPDATE ON backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create retry handling function
CREATE OR REPLACE FUNCTION handle_backup_retry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' AND NEW.retry_count < 3 THEN
    NEW.retry_count := NEW.retry_count + 1;
    NEW.next_retry_at := NOW() + (POWER(2, NEW.retry_count) * interval '1 minute');
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add retry trigger
CREATE TRIGGER handle_backup_retry
  BEFORE UPDATE OF status ON backups
  FOR EACH ROW
  WHEN (NEW.status = 'failed')
  EXECUTE FUNCTION handle_backup_retry();

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

-- Add cleanup function
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