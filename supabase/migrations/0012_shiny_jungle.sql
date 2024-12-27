-- Add error_message column to backups table
ALTER TABLE backups
ADD COLUMN IF NOT EXISTS error_message text;

-- Add metadata column for additional backup information
ALTER TABLE backups
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Create index for faster backup queries
CREATE INDEX IF NOT EXISTS idx_backups_project_status 
ON backups(project_id, status);

-- Create index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_backups_expires_at 
ON backups(expires_at);

-- Add trigger to clean up storage when backup is deleted
CREATE OR REPLACE FUNCTION delete_backup_file()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the file from storage
  PERFORM storage.delete('backups', OLD.file_path);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_delete_backup_file
  AFTER DELETE ON backups
  FOR EACH ROW
  EXECUTE FUNCTION delete_backup_file();