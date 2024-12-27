/*
  # Add project settings and backup schedules

  1. Changes
    - Add backup_schedule column to project_settings
    - Add trigger to update project settings timestamps
    - Add function to validate backup schedule

  2. Security
    - RLS policies are inherited from previous migrations
*/

-- Add backup schedule to project settings
ALTER TABLE project_settings 
ADD COLUMN IF NOT EXISTS backup_schedule text NOT NULL DEFAULT 'daily'
CHECK (backup_schedule IN ('daily', 'weekly', 'monthly'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project_settings
CREATE TRIGGER update_project_settings_updated_at
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create trigger for projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();