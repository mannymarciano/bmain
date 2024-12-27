import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FormField } from '../FormField';
import { TimezoneSettings } from './TimezoneSettings';

export function GeneralSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <FormField
            label="Email"
            value={user?.email || ''}
            disabled
            type="email"
          />
          <FormField
            label="Full Name"
            value={user?.user_metadata?.full_name || ''}
            disabled
            placeholder="Contact support to update"
          />
        </div>
      </div>

      <TimezoneSettings />
    </div>
  );
}