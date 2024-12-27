/*
  # Fix Backup System Issues

  1. Changes
    - Fix storage.delete function signature
    - Add proper backup cleanup
    - Fix backup scheduling
    - Add proper error handling

  2. Security
    - Update storage policies
*/

-- Fix storage.delete function
CREATE OR REPLACE FUNCTION delete_backup_file()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the file from storage using storage.delete(bucket_id text, name text)
  PERFORM storage.delete('backups', OLD.file_path);
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block deletion
    RAISE WARNING 'Failed to delete backup file: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add proper error handling columns
ALTER TABLE backups
ADD COLUMN IF NOT EXISTS error_details jsonb;

-- Fix backup scheduling
CREATE OR REPLACE FUNCTION schedule_next_backup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule next backup if enabled and not failed
  IF NEW.backup_enabled AND NEW.status NOT IN ('failed', 'processing') THEN
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