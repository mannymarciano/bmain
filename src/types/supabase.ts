export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          app_url: string
          status: string
          data_types_count: number
          total_rows: number
          server_region: string
          next_backup_at: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_url: string
          status?: string
          data_types_count?: number
          total_rows?: number
          server_region: string
          next_backup_at: string
          timezone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_url?: string
          status?: string
          data_types_count?: number
          total_rows?: number
          server_region?: string
          next_backup_at?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}