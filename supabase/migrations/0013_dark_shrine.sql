/*
  # Fix Backup Scheduling System

  1. Changes
    - Add missing columns to project_settings
    - Update backup scheduling trigger
    - Add backup status tracking
    - Fix timezone handling

  2. Security
    - Add RLS policies for project settings
*/

-- Add missing columns to project_settings
ALTER TABLE project_settings
ADD COLUMN IF NOT EXISTS backup_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_backup_status text,
ADD COLUMN IF NOT EXISTS last_backup_error text,
ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

-- Create function to handle backup scheduling
CREATE OR REPLACE FUNCTION schedule_next_backup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule next backup if backups are enabled
  IF NEW.backup_enabled THEN
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

-- Create trigger for backup scheduling
DROP TRIGGER IF EXISTS tr_schedule_next_backup ON project_settings;
CREATE TRIGGER tr_schedule_next_backup
  BEFORE INSERT OR UPDATE OF backup_schedule, backup_hour, backup_minute, backup_enabled
  ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION schedule_next_backup();

-- Update project settings policies
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