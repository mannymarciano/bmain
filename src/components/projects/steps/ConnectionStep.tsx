import React from 'react';
import { FormField } from '../../FormField';
import { ProjectFormData } from '../../../types/project';

interface ConnectionStepProps {
  formData: ProjectFormData;
  onUpdate: (data: ProjectFormData) => void;
  onNext: () => void;
}

const REGIONS = [
  { id: 'us-east', label: 'AWS - East US', available: true },
  { id: 'eu-west', label: 'AWS - West EU (London)', available: true },
  { id: 'ap-northeast', label: 'AWS - Northeast Asia', available: false },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
].map(tz => ({ value: tz, label: tz }));

export function ConnectionStep({ formData, onUpdate, onNext }: ConnectionStepProps) {
  const isValid = formData.appUrl && formData.apiKey && formData.timezone && formData.serverRegion;

  return (
    <div className="space-y-6">
      <FormField
        label="Bubble App URL"
        value={formData.appUrl}
        onChange={(appUrl) => onUpdate({ ...formData, appUrl })}
        placeholder="https://your-app.bubbleapps.io"
      />

      <FormField
        label="API Key"
        type="password"
        value={formData.apiKey}
        onChange={(apiKey) => onUpdate({ ...formData, apiKey })}
        placeholder="Enter your Bubble.io API key"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => onUpdate({ ...formData, timezone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select timezone</option>
          {TIMEZONES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Backups will run at 2:00 AM in your selected timezone
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Backup Server Region
        </label>
        <div className="grid grid-cols-1 gap-3">
          {REGIONS.map((region) => (
            <label
              key={region.id}
              className={`
                relative flex items-center p-4 border rounded-lg cursor-pointer
                ${region.available ? 'hover:border-indigo-500' : 'opacity-50 cursor-not-allowed'}
                ${formData.serverRegion === region.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
              `}
            >
              <input
                type="radio"
                name="server-region"
                value={region.id}
                disabled={!region.available}
                checked={formData.serverRegion === region.id}
                onChange={(e) => onUpdate({ ...formData, serverRegion: e.target.value })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  {region.label}
                </span>
                {!region.available && (
                  <span className="block text-xs text-gray-500">Coming Soon</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}