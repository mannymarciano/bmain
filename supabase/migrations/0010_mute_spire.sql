/*
  # Fix backup storage permissions

  1. Changes
    - Add proper storage bucket policies
    - Fix file path structure
    - Add missing RLS policies
*/

-- Recreate storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can read their own backup files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own backup files" ON storage.objects;

-- Create proper storage policies
CREATE POLICY "Users can read their own backup files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'backups' AND
    (SELECT created_by FROM backups WHERE file_path = name) = auth.uid()
  );

CREATE POLICY "Users can upload their own backup files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'backups' AND
    (SELECT created_by FROM backups WHERE file_path = name) = auth.uid()
  );

-- Add delete policy for expired backups
CREATE POLICY "Users can delete their expired backup files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'backups' AND
    (SELECT created_by FROM backups WHERE file_path = name) = auth.uid() AND
    (SELECT expires_at FROM backups WHERE file_path = name) < now()
  );