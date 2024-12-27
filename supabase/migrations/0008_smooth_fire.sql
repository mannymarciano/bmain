/*
  # Fix cascade deletion for projects

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - This ensures child records are automatically deleted when a project is deleted

  2. Implementation
    - Drop existing foreign key constraints
    - Recreate constraints with CASCADE option
*/

-- Drop existing foreign key constraints
ALTER TABLE project_settings
DROP CONSTRAINT IF EXISTS project_settings_project_id_fkey;

ALTER TABLE backups
DROP CONSTRAINT IF EXISTS backups_project_id_fkey;

-- Recreate constraints with CASCADE
ALTER TABLE project_settings
ADD CONSTRAINT project_settings_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

ALTER TABLE backups
ADD CONSTRAINT backups_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;