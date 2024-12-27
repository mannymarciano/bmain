import React from 'react';
import { Database, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import { BackupStats as BackupStatsType } from '../../types/backup';
import { formatBytes } from '../../utils/formatters';

interface BackupStatsProps {
  stats: BackupStatsType;
}

export function BackupStats({ stats }: BackupStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-indigo-600" />
          <span className="ml-2 text-sm font-medium text-gray-500">Total Backups</span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalBackups}</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <HardDrive className="h-5 w-5 text-indigo-600" />
          <span className="ml-2 text-sm font-medium text-gray-500">Total Size</span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{formatBytes(stats.totalSize)}</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          {stats.lastBackupStatus === 'completed' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : stats.lastBackupStatus === 'failed' ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Database className="h-5 w-5 text-gray-400" />
          )}
          <span className="ml-2 text-sm font-medium text-gray-500">Last Backup Status</span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-gray-900 capitalize">
          {stats.lastBackupStatus || 'N/A'}
        </p>
      </div>
    </div>
  );
}