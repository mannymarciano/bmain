import React from 'react';
import { Globe, Database, Server, Clock } from 'lucide-react';
import { Project } from '../../types/project';
import { formatBubbleUrl } from '../../utils/validation';
import { ProjectMenu } from './ProjectMenu';
import { BackupTiming } from './BackupTiming';
import { useProjectSettings } from '../../hooks/useProjectSettings';
import { updateProjectStatus } from '../../services/projectService';

interface ProjectCardProps {
  project: Project;
  onViewData: () => void;
}

export function ProjectCard({ project, onViewData }: ProjectCardProps) {
  const { settings, isLoading, error } = useProjectSettings(project.id);
  
  const handleStatusChange = async (projectId: string, status: 'active' | 'paused') => {
    try {
      await updateProjectStatus(projectId, status);
      // Force refresh to show updated status
      window.location.reload();
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const getDisplayUrl = (url: string) => {
    try {
      const cleanUrl = formatBubbleUrl(url);
      return new URL(cleanUrl).hostname;
    } catch (error) {
      return url;
    }
  };

  const displayUrl = getDisplayUrl(project.app_url || 'bolt-test-69816.bubbleapps.io');

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {displayUrl}
            </h3>
          </div>
          <ProjectMenu project={project} onStatusChange={handleStatusChange} />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="text-sm text-gray-600">
              {project.data_types_count || 0} data {project.data_types_count === 1 ? 'type' : 'types'}
              {project.total_rows > 0 && `, ${project.total_rows.toLocaleString()} rows`}
            </span>
          </div>
          
          <div className="flex items-center">
            <Server className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="text-sm text-gray-600">{project.server_region || 'Unknown region'}</span>
          </div>

          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Failed to load backup timing
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <BackupTiming 
              lastBackupAt={settings?.last_backup_at} 
              nextBackupAt={settings?.next_backup_at}
            />
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status || 'unknown'}
          </span>
          <button 
            onClick={onViewData}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Data
          </button>
        </div>
      </div>
    </div>
  );
}