import React from 'react';
import { TopHeader } from './TopHeader';
import { NavigationBar } from './NavigationBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

export function DashboardLayout({
  children,
  currentSection,
  onSectionChange,
  onSignOut
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader onSignOut={onSignOut} />
      <NavigationBar currentSection={currentSection} onSectionChange={onSectionChange} />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}