import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Lock } from 'lucide-react';
import { detectUserTimezone, TIMEZONE_OPTIONS, formatTimezoneOffset } from '../../utils/timezone';
import { TimeZone } from '../../types/settings';
import { useProjects } from '../../hooks/useProjects';
import { updateProjectTimezone } from '../../services/projectService';

export function TimezoneSettings() {
  const [userTimezone, setUserTimezone] = useState<TimeZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { projects } = useProjects();

  useEffect(() => {
    async function loadTimezone() {
      try {
        const timezone = await detectUserTimezone();
        setUserTimezone(timezone);
      } catch (error) {
        console.error('Failed to detect timezone:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTimezone();
  }, []);

  const handleProjectTimezoneChange = async (projectId: string, newTimezone: string) => {
    try {
      setIsSaving(true);
      setMessage(null);
      await updateProjectTimezone(projectId, newTimezone);
      setMessage({ type: 'success', text: 'Project timezone updated successfully' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update project timezone'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading timezone information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Location:</span>
              <span className="ml-2 font-medium">
                {userTimezone?.city}, {userTimezone?.country}
              </span>
              <span className="ml-2 text-xs text-gray-400">(Contact support to update)</span>
            </div>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">System Timezone:</span>
              <span className="ml-2 font-medium">
                {TIMEZONE_OPTIONS.find(tz => tz.value === userTimezone?.timezone)?.label || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Timezones</h3>
        
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{project.appUrl}</span>
              <select
                value={project.timezone}
                onChange={(e) => handleProjectTimezoneChange(project.id, e.target.value)}
                disabled={isSaving}
                className="ml-4 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}