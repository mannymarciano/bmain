import React from 'react';
import { Database, LogOut } from 'lucide-react';

interface TopHeaderProps {
  onSignOut: () => void;
}

export function TopHeader({ onSignOut }: TopHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Bubble.io Data Manager
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}