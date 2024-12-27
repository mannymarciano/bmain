import React, { useState } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { ScheduleOption, ScheduledFetch } from '../types/scheduler';
import { PasswordModal } from './ui/PasswordModal';
import { validateInputs } from '../utils/validation';

interface RecurringSchedulerProps {
  schedule: ScheduledFetch | null;
  onSchedule: (minutes: ScheduleOption) => void;
  onStop: () => void;
  disabled: boolean;
  url: string;
  apiKey: string;
}

export function RecurringScheduler({ 
  schedule, 
  onSchedule, 
  onStop,
  disabled,
  url,
  apiKey
}: RecurringSchedulerProps) {
  const options: ScheduleOption[] = [1, 2, 5];
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleScheduleStart = (interval: ScheduleOption) => {
    if (!validateInputs(url, apiKey)) {
      return;
    }
    onSchedule(interval);
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === '123') {
      onStop();
      setShowPasswordModal(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {!schedule?.isActive ? (
          <div className="flex gap-2">
            {options.map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleScheduleStart(minutes)}
                disabled={disabled}
                className="flex items-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Clock className="w-4 h-4 mr-1" />
                Every {minutes} min
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Pause className="w-4 h-4 mr-1" />
            Stop Schedule ({schedule.interval}min)
          </button>
        )}

        {schedule?.isActive && schedule.nextFetch && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Play className="w-4 h-4" />
            Next fetch: {schedule.nextFetch.toLocaleTimeString()}
          </div>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
}