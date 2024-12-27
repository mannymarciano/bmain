import React from 'react';
import { Database } from 'lucide-react';

export function LayoutHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Bubble.io Data Manager
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}