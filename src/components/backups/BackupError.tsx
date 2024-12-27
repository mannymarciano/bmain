import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BackupErrorProps {
  error: string;
  onRetry?: () => void;
}

export function BackupError({ error, onRetry }: BackupErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Backup Failed</h3>
          <div className="mt-1 text-sm text-red-700">{error}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Retry Backup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}