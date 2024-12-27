import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { initiateManualBackup } from '../../services/backupService';
import { BackupError } from './BackupError';
import { useProject } from '../../hooks/useProject';

interface ManualBackupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function ManualBackupDialog({
  isOpen,
  onClose,
  projectId,
  projectName
}: ManualBackupDialogProps) {
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { project, isLoading, error: projectError } = useProject(projectId);

  const handleBackup = async () => {
    if (!project) {
      setError('Project data not found');
      return;
    }

    try {
      setIsInitiating(true);
      setError(null);
      const result = await initiateManualBackup(project);
      
      if (result.status === 'failed') {
        throw new Error(result.error || 'Backup failed');
      }
      
      onClose();
      window.location.reload(); // Refresh to show new backup
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate backup');
    } finally {
      setIsInitiating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-medium">Manual Backup</h2>
        </div>

        {projectError ? (
          <BackupError error={projectError} />
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              Are you sure you want to initiate a manual backup for <strong>{projectName}</strong>?
              This will create an immediate backup of all your data.
            </p>

            {error && <BackupError error={error} onRetry={handleBackup} />}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={isInitiating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBackup}
                disabled={isInitiating || isLoading || !project}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isInitiating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initiating...
                  </>
                ) : (
                  'Start Backup'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}