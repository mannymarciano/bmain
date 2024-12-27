import React, { useState } from 'react';
import { MoreVertical, Trash2, RefreshCw, Settings, PauseCircle, PlayCircle, Database } from 'lucide-react';
import { Project } from '../../types/project';
import { DeleteProjectModal } from './DeleteProjectModal';
import { RescanProjectModal } from './RescanProjectModal';
import { ManualBackupDialog } from '../backups/ManualBackupDialog';

interface ProjectMenuProps {
  project: Project;
  onStatusChange: (projectId: string, status: 'active' | 'paused') => void;
}

export function ProjectMenu({ project, onStatusChange }: ProjectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRescanModal, setShowRescanModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const displayUrl = project.app_url.replace(/^https?:\/\//, '');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowBackupModal(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Database className="w-4 h-4 mr-2" />
                Manual Backup
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowRescanModal(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rescan Data Types
              </button>

              <button
                onClick={() => onStatusChange(project.id, project.status === 'active' ? 'paused' : 'active')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {project.status === 'active' ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Pause Backups
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume Backups
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteModal(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </button>
            </div>
          </div>
        </>
      )}

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        projectId={project.id}
        projectName={displayUrl}
      />

      <RescanProjectModal
        isOpen={showRescanModal}
        onClose={() => setShowRescanModal(false)}
        project={project}
      />

      <ManualBackupDialog
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        projectId={project.id}
        projectName={displayUrl}
      />
    </div>
  );
}