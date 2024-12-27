import React from 'react';
import { formatDistanceToNow, formatDistanceToNowStrict, isPast } from 'date-fns';
import { Clock } from 'lucide-react';

interface BackupTimingProps {
  lastBackupAt: string | null;
  nextBackupAt: string | null;
}

export function BackupTiming({ lastBackupAt, nextBackupAt }: BackupTimingProps) {
  const getLastBackupText = () => {
    if (!lastBackupAt) return 'Never';
    return `${formatDistanceToNow(new Date(lastBackupAt))} ago`;
  };

  const getNextBackupText = () => {
    if (!nextBackupAt) return 'Not scheduled';
    const nextDate = new Date(nextBackupAt);
    if (isPast(nextDate)) return 'Overdue';
    return formatDistanceToNowStrict(nextDate);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center text-sm">
        <Clock className="w-4 h-4 mr-2 text-gray-400" />
        <span className="text-gray-500">Last backup: </span>
        <span className="ml-1 font-medium text-gray-700">{getLastBackupText()}</span>
      </div>
      <div className="flex items-center text-sm">
        <Clock className="w-4 h-4 mr-2 text-gray-400" />
        <span className="text-gray-500">Next backup in: </span>
        <span className="ml-1 font-medium text-gray-700">{getNextBackupText()}</span>
      </div>
    </div>
  );
}