import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteProject } from '../../services/projectService';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  projectId,
  projectName
}: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toLowerCase() === 'delete';

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteProject(projectId);
      onClose();
      // Force reload projects list
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Delete Project</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-sm text-red-600">
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete:
            </p>
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              <li>All project configuration</li>
              <li>All backup history</li>
              <li>All stored backup files</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type "delete" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              disabled={isDeleting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || !isConfirmed}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}