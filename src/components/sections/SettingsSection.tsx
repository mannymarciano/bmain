import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { GeneralSettings } from '../settings/GeneralSettings';
import { SecuritySettings } from '../settings/SecuritySettings';
import { NotificationSettings } from '../settings/NotificationSettings';
import { SettingsTabs } from '../settings/SettingsTabs';

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}