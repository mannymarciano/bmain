import React from 'react';
import { BackupRow } from './BackupRow';
import { Backup } from '../../types/backup';

interface BackupListProps {
  backups: Backup[];
}

export function BackupList({ backups }: BackupListProps) {
  const latestBackupId = backups.length > 0 ? backups[0].id : null;

  return (
    <div className="mt-6">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Schedule
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Created
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Expires
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Size
              </th>
              <th className="relative py-3.5 pl-3 pr-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {backups.map((backup) => (
              <BackupRow 
                key={backup.id} 
                backup={backup} 
                isLatest={backup.id === latestBackupId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}