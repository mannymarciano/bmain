import React from 'react';
import { Clock } from 'lucide-react';
import { ProjectFormData } from '../../../types/project';
import { BackupScheduleType } from '../../../types/backup';

interface ScheduleStepProps {
  formData: ProjectFormData;
  onUpdate: (data: ProjectFormData) => void;
  onBack: () => void;
  onComplete: () => void;
}

const SCHEDULE_OPTIONS: { value: BackupScheduleType; label: string; description: string }[] = [
  { 
    value: 'daily', 
    label: 'Daily Backups', 
    description: 'Runs at 2:00 AM in your timezone. Backups expire after 60 days.' 
  },
  { 
    value: 'weekly', 
    label: 'Weekly Backups', 
    description: 'Runs every Monday at 2:00 AM in your timezone. Backups expire after 90 days.' 
  },
  { 
    value: 'monthly', 
    label: 'Monthly Backups', 
    description: 'Runs on the 1st of each month at 2:00 AM in your timezone. Backups expire after 180 days.' 
  },
];

export function ScheduleStep({ formData, onUpdate, onBack, onComplete }: ScheduleStepProps) {
  const handleSubmit = async () => {
    try {
      onComplete();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Backup Schedule
        </label>
        <div className="grid grid-cols-1 gap-3">
          {SCHEDULE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`
                relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-indigo-500
                ${formData.schedule === option.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
              `}
            >
              <input
                type="radio"
                name="schedule"
                value={option.value}
                checked={formData.schedule === option.value}
                onChange={(e) => onUpdate({ ...formData, schedule: e.target.value as BackupScheduleType })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-3">
                <span className="flex items-center text-sm font-medium text-gray-900">
                  <Clock className="w-4 h-4 mr-2" />
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.schedule}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Create Project
        </button>
      </div>
    </div>
  );
}