/*
  # Backup System Implementation

  1. New Tables
    - `backups`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `file_path` (text, storage path)
      - `status` (text: pending, processing, completed, failed)
      - `schedule_type` (text: daily, weekly, monthly)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `size_bytes` (bigint)
      - `record_count` (integer)
  
  2. Storage
    - Create backups bucket
    - Set up storage policies
*/

-- Create backups bucket
INSERT INTO storage.buckets (id, name)
VALUES ('backups', 'backups')
ON CONFLICT DO NOTHING;

-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  schedule_type text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  size_bytes bigint DEFAULT 0,
  record_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Policies for backups table
CREATE POLICY "Users can view their own backups"
  ON backups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own backups"
  ON backups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Storage policies
CREATE POLICY "Users can read their own backup files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'backups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own backup files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'backups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );