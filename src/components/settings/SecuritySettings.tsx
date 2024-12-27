import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FormField } from '../FormField';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setIsChanging(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update password' 
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update your password and security preferences.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <FormField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
        />

        <FormField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleChangePassword}
          disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isChanging ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}