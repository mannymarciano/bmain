import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Backup, BackupScheduleType, BackupStats } from '../types/backup';

export function useBackups(
  projectId: string | null,
  scheduleFilter: BackupScheduleType | 'all' = 'all',
  dateRange: [Date | null, Date | null] = [null, null]
) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats>({
    totalBackups: 0,
    totalSize: 0,
    lastBackupStatus: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBackups() {
      if (!projectId) return;

      try {
        let query = supabase
          .from('backups')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (scheduleFilter !== 'all') {
          query = query.eq('schedule_type', scheduleFilter);
        }

        if (dateRange[0] && dateRange[1]) {
          query = query
            .gte('created_at', dateRange[0].toISOString())
            .lte('created_at', dateRange[1].toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const backupData = data || [];
        setBackups(backupData);

        // Calculate stats
        setStats({
          totalBackups: backupData.length,
          totalSize: backupData.reduce((sum, backup) => sum + (backup.size_bytes || 0), 0),
          lastBackupStatus: backupData[0]?.status || null
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch backups');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBackups();
  }, [projectId, scheduleFilter, dateRange]);

  return { backups, stats, isLoading, error };
}