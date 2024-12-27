/*
  # Create projects table with user ownership

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `app_url` (text)
      - `status` (text)
      - `data_types_count` (integer)
      - `total_rows` (integer)
      - `server_region` (text)
      - `next_backup_at` (timestamptz)
      - `timezone` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policy for authenticated users to manage their own projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_url text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  data_types_count integer NOT NULL DEFAULT 0,
  total_rows integer NOT NULL DEFAULT 0,
  server_region text NOT NULL,
  next_backup_at timestamptz NOT NULL,
  timezone text NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);