import React, { useState } from 'react';
import { Download, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Backup } from '../../types/backup';
import { formatBytes } from '../../utils/formatters';
import { ExpirationCountdown } from './ExpirationCountdown';
import { downloadBackup } from '../../services/downloadService';

interface BackupRowProps {
  backup: Backup;
  isLatest?: boolean;
}

export function BackupRow({ backup, isLatest }: BackupRowProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusIcons = {
    pending: <Clock className="h-5 w-5 text-yellow-500" />,
    processing: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    failed: <XCircle className="h-5 w-5 text-red-500" />
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      await downloadBackup(backup.file_path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
        <div className="flex items-center">
          {statusIcons[backup.status]}
          <span className="ml-2 text-gray-900">{backup.status}</span>
          {isLatest && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Latest
            </span>
          )}
          {backup.error_details && (
            <span className="ml-2 text-red-600 text-xs">
              {backup.error_details.message}
            </span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {backup.schedule_type}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {new Date(backup.created_at).toLocaleString()}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <ExpirationCountdown expiresAt={backup.expires_at} />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {formatBytes(backup.size_bytes)}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
        <button
          onClick={handleDownload}
          disabled={backup.status !== 'completed' || isDownloading}
          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          <span className="sr-only">Download</span>
        </button>
        {error && (
          <div className="absolute right-0 mt-1 text-xs text-red-600">
            {error}
          </div>
        )}
      </td>
    </tr>
  );
}