import React from 'react';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import { SchedulerStats } from '../types/scheduler';

interface ScheduleStatsProps {
  stats: SchedulerStats;
}

export function ScheduleStats({ stats }: ScheduleStatsProps) {
  return (
    <div className="flex gap-4 p-3 bg-gray-50 rounded-md">
      <div className="flex items-center gap-1">
        <Activity className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Total: {stats.totalFetches}</span>
      </div>
      {stats.lastFetchStatus && (
        <div className="flex items-center gap-1">
          {stats.lastFetchStatus === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            Last: {stats.lastFetchStatus}
          </span>
        </div>
      )}
      {stats.errorCount > 0 && (
        <div className="text-sm text-red-600">
          Errors: {stats.errorCount}
        </div>
      )}
    </div>
  );
}