import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { BackupList } from '../backups/BackupList';
import { BackupStats } from '../backups/BackupStats';
import { BackupFilters } from '../backups/BackupFilters';
import { useBackups } from '../../hooks/useBackups';
import { BackupScheduleType } from '../../types/backup';
import { useProject } from '../../hooks/useProject';

interface DataSectionProps {
  projectId: string | null;
}

export function DataSection({ projectId }: DataSectionProps) {
  const [scheduleFilter, setScheduleFilter] = useState<BackupScheduleType | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const { project, isLoading: projectLoading } = useProject(projectId);
  const { backups, stats, isLoading: backupsLoading } = useBackups(projectId, scheduleFilter, dateRange);

  if (!projectId) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No project selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a project from the overview to view its data.
        </p>
      </div>
    );
  }

  if (projectLoading || backupsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {project?.app_url || 'Unknown Project'}
            </h2>
            <p className="text-sm text-gray-500">Backup History</p>
          </div>
          <BackupFilters
            scheduleFilter={scheduleFilter}
            onScheduleChange={setScheduleFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <BackupStats stats={stats} />

        {backups.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No backups</h3>
            <p className="mt-1 text-sm text-gray-500">
              No backups have been created yet.
            </p>
          </div>
        ) : (
          <BackupList backups={backups} />
        )}
      </div>
    </div>
  );
}