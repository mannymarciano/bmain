import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'backup_success',
    title: 'Backup Success',
    description: 'Receive notifications when backups complete successfully',
    icon: CheckCircle
  },
  {
    id: 'backup_failure',
    title: 'Backup Failure',
    description: 'Get notified when backups fail or encounter errors',
    icon: AlertTriangle
  },
  {
    id: 'schedule_changes',
    title: 'Schedule Changes',
    description: 'Notifications about backup schedule changes',
    icon: Bell
  }
];

export function NotificationSettings() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(['backup_failure']));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleNotification = (id: string) => {
    const newEnabled = new Set(enabled);
    if (newEnabled.has(id)) {
      newEnabled.delete(id);
    } else {
      newEnabled.add(id);
    }
    setEnabled(newEnabled);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      
      // TODO: Implement notification preferences saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Notification preferences updated' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update preferences' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose which notifications you'd like to receive.
        </p>
      </div>

      <div className="space-y-4">
        {notificationSettings.map(({ id, title, description, icon: Icon }) => (
          <div key={id} className="flex items-start space-x-4">
            <div className="flex-shrink-0 pt-0.5">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor={id} className="text-sm font-medium text-gray-900">
                {title}
              </label>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={enabled.has(id)}
                onClick={() => toggleNotification(id)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  ${enabled.has(id) ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
              >
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                    transition duration-200 ease-in-out
                    ${enabled.has(id) ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        ))}
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
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}