import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ConnectionStep } from './steps/ConnectionStep';
import { ScanningStep } from './steps/ScanningStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { createProject } from '../../services/projectService';
import { ProjectFormData } from '../../types/project';
import { BackupScheduleType } from '../../types/backup';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    appUrl: '',
    apiKey: '',
    timezone: '',
    serverRegion: '',
    dataTypes: [],
    schedule: 'daily' as BackupScheduleType
  });

  const handleComplete = async () => {
    try {
      setError(null);
      await createProject(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Connection Details' },
    { number: 2, title: 'Data Discovery' },
    { number: 3, title: 'Schedule Setup' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            <p className="mt-1 text-sm text-gray-500">
              Step {step} of {steps.length}: {steps[step - 1].title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <ConnectionStep
              formData={formData}
              onUpdate={setFormData}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <ScanningStep
              formData={formData}
              onUpdate={setFormData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ScheduleStep
              formData={formData}
              onUpdate={setFormData}
              onBack={() => setStep(2)}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}