import React from 'react';
import { LayoutDashboard, Database, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'data', label: 'Data', icon: <Database className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface NavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function NavigationBar({ currentSection, onSectionChange }: NavigationBarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-14">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                flex items-center px-3 py-2 text-sm font-medium border-b-2 -mb-px
                transition-colors duration-200
                ${currentSection === item.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}