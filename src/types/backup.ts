import { Project } from './project';

export type BackupStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type BackupScheduleType = 'daily' | 'weekly' | 'monthly' | 'manual';

export interface Backup {
  id: string;
  project_id: string;
  file_path: string;
  status: BackupStatus;
  schedule_type: BackupScheduleType;
  size_bytes: number;
  record_count: number;
  error_details?: { message: string };
  metadata?: Record<string, any>;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface BackupResult {
  id: string;
  status: BackupStatus;
  sizeBytes: number;
  recordCount: number;
  error?: string;
  filePath: string;
}

export interface BackupOptions {
  project: Project;
  scheduleType: BackupScheduleType;
}