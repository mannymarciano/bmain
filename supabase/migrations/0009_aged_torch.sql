/*
  # Fix Backup RLS Policies

  1. Changes
    - Update RLS policies for backups table to allow manual backups
    - Add policy for manual backup creation
    - Add policy for backup status updates

  2. Security
    - Maintain user isolation
    - Allow users to create and manage their own backups
    - Ensure backups are associated with user's projects
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own backups" ON backups;
DROP POLICY IF EXISTS "Users can create their own backups" ON backups;

-- Create comprehensive backup policies
CREATE POLICY "Users can view backups for their projects"
  ON backups
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create backups for their projects"
  ON backups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their project backups"
  ON backups
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