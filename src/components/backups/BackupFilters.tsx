import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { BackupScheduleType } from '../../types/backup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BackupFiltersProps {
  scheduleFilter: BackupScheduleType | 'all';
  onScheduleChange: (schedule: BackupScheduleType | 'all') => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
}

export function BackupFilters({
  scheduleFilter,
  onScheduleChange,
  dateRange,
  onDateRangeChange,
}: BackupFiltersProps) {
  const scheduleOptions: { value: BackupScheduleType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Schedules' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const [startDate, endDate] = dateRange;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <select
          value={scheduleFilter}
          onChange={(e) => onScheduleChange(e.target.value as BackupScheduleType | 'all')}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {scheduleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => onDateRangeChange(update as [Date | null, Date | null])}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholderText="Select date range"
        />
      </div>
    </div>
  );
}