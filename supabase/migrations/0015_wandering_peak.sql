/*
  # Fix Backup System Issues

  1. Changes
    - Add backup status tracking
    - Add error handling columns
    - Add backup scheduling improvements
    - Add proper indexes

  2. Security
    - Update storage policies
*/

-- Add missing columns to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS backup_enabled boolean NOT NULL DEFAULT true;

-- Update project settings
ALTER TABLE project_settings
ADD COLUMN IF NOT EXISTS backup_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_backup_status text,
ADD COLUMN IF NOT EXISTS last_backup_error text;

-- Fix backup scheduling function
CREATE OR REPLACE FUNCTION schedule_next_backup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule next backup if backups are enabled
  IF NEW.backup_enabled AND NEW.status != 'failed' THEN
    NEW.next_backup_at := calculate_next_backup(
      NEW.backup_schedule,
      (SELECT timezone FROM projects WHERE id = NEW.project_id),
      NEW.backup_hour,
      NEW.backup_minute
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_settings_backup_status
ON project_settings(project_id, backup_enabled, next_backup_at)
WHERE backup_enabled = true;

CREATE INDEX IF NOT EXISTS idx_backups_project_status
ON backups(project_id, status, created_at DESC);

-- Drop existing storage policies first
DROP POLICY IF EXISTS "Users can delete their backup files" ON storage.objects;

-- Recreate storage policies
DO $$ 
BEGIN
  -- Create delete policy
  EXECUTE format('
    CREATE POLICY "Users can delete their backup files" ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = ''backups'' 
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
  ');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;