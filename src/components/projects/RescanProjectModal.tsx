import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Project } from '../../types/project';
import { fetchBubbleMetadata } from '../../utils/api/bubbleMetadataApi';
import { compareDataTypes } from '../../utils/dataTypeComparison';
import { updateProjectDataTypes } from '../../services/projectService';

interface RescanProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function RescanProjectModal({
  isOpen,
  onClose,
  project
}: RescanProjectModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<{
    added: string[];
    removed: string[];
  } | null>(null);
  const [scanComplete, setScanComplete] = useState(false);

  const handleRescan = async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScanComplete(false);
      setComparison(null);

      const newDataTypes = await fetchBubbleMetadata(project.app_url, project.api_key);
      const changes = compareDataTypes(project.data_types, newDataTypes);
      setComparison(changes);
      
      if (changes.added.length === 0 && changes.removed.length === 0) {
        setScanComplete(true);
        return;
      }

      await updateProjectDataTypes(project.id, newDataTypes);
      setScanComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rescan data types');
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center text-indigo-600">
            <RefreshCw className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Rescan Data Types</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!scanComplete ? (
            <>
              <p className="text-gray-600 mb-4">
                This will scan your Bubble.io application for any new or removed data types.
                The backup configuration will be updated accordingly.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isScanning}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isScanning ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </span>
                  ) : (
                    'Start Scan'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Scan Complete
              </h3>
              
              {comparison && (comparison.added.length > 0 || comparison.removed.length > 0) ? (
                <div className="text-left mt-4 space-y-3">
                  {comparison.added.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <h4 className="font-medium text-green-800 mb-1">New Data Types:</h4>
                      <ul className="list-disc list-inside text-sm text-green-700">
                        {comparison.added.map(type => (
                          <li key={type}>{type}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comparison.removed.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-md">
                      <h4 className="font-medium text-red-800 mb-1">Removed Data Types:</h4>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {comparison.removed.map(type => (
                          <li key={type}>{type}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  No changes detected in data types
                </p>
              )}
              
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}