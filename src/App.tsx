import React, { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewSection } from './components/sections/OverviewSection';
import { DataSection } from './components/sections/DataSection';
import { SettingsSection } from './components/sections/SettingsSection';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { AuthFeatures } from './components/auth/AuthFeatures';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, isLoading, signOut } = useAuth();
  const [currentSection, setCurrentSection] = useState('overview');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleViewData = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentSection('data');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthLayout 
        title={isSignUp ? 'Create your account' : 'Sign in to your account'}
        leftContent={<AuthFeatures />}
      >
        {isSignUp ? (
          <>
            <SignUpForm onSuccess={() => setIsSignUp(false)} />
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onSuccess={() => {}} />
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create an account
              </button>
            </p>
          </>
        )}
      </AuthLayout>
    );
  }

  return (
    <DashboardLayout
      currentSection={currentSection}
      onSectionChange={(section) => {
        setCurrentSection(section);
        if (section !== 'data') {
          setSelectedProjectId(null);
        }
      }}
      onSignOut={signOut}
    >
      {currentSection === 'overview' && (
        <OverviewSection onViewData={handleViewData} />
      )}
      {currentSection === 'data' && (
        <DataSection projectId={selectedProjectId} />
      )}
      {currentSection === 'settings' && <SettingsSection />}
    </DashboardLayout>
  );
}