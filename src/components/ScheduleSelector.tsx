import React from 'react';
import { Clock } from 'lucide-react';
import { ScheduleOption } from '../types/scheduler';

interface ScheduleSelectorProps {
  onSchedule: (minutes: ScheduleOption) => void;
  disabled: boolean;
}

export function ScheduleSelector({ onSchedule, disabled }: ScheduleSelectorProps) {
  const options: ScheduleOption[] = [1, 2, 5];

  return (
    <div className="flex gap-2">
      {options.map((minutes) => (
        <button
          key={minutes}
          onClick={() => onSchedule(minutes)}
          disabled={disabled}
          className="flex items-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="w-4 h-4 mr-1" />
          {minutes} min
        </button>
      ))}
    </div>
  );
}