export interface Project {
  id: string;
  app_url: string;
  server_region: string;
  timezone: string;
  data_types: string[];
  api_key: string;
  data_types_count: number;
  total_rows: number;
  status: 'active' | 'paused';
  backup_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  appUrl: string;
  apiKey: string;
  timezone: string;
  serverRegion: string;
  dataTypes: string[];
  schedule: BackupScheduleType;
}