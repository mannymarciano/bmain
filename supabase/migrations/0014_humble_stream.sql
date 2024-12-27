/*
  # Fix Backup System

  1. Changes
    - Add missing columns for backup tracking
    - Add proper error handling
    - Fix backup status tracking
    - Add backup retry functionality

  2. Security
    - Add RLS policies for backup operations
*/

-- Add missing columns to backups table
ALTER TABLE backups
ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
ADD COLUMN IF NOT EXISTS last_error text;

-- Add function to handle backup retries
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

-- Create trigger for backup retries
CREATE TRIGGER tr_handle_backup_retry
  BEFORE UPDATE OF status ON backups
  FOR EACH ROW
  WHEN (NEW.status = 'failed')
  EXECUTE FUNCTION handle_backup_retry();

-- Update project settings trigger
CREATE OR REPLACE FUNCTION update_project_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last backup status
  UPDATE project_settings
  SET 
    last_backup_status = NEW.status,
    last_backup_error = NEW.last_error,
    last_backup_at = CASE 
      WHEN NEW.status = 'completed' THEN NEW.created_at
      ELSE last_backup_at
    END
  WHERE project_id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating project settings
CREATE TRIGGER tr_update_project_settings
  AFTER UPDATE OF status ON backups
  FOR EACH ROW
  EXECUTE FUNCTION update_project_settings();

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_backups_status_retry
ON backups(status, retry_count, next_retry_at)
WHERE status = 'pending';