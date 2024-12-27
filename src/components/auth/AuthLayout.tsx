import React from 'react';
import { Database } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  leftContent?: React.ReactNode;
}

export function AuthLayout({ children, title, leftContent }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side with features */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between p-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Bubble.io Data Manager
            </span>
          </div>
          {leftContent}
        </div>
        {/* Decorative diagonal lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 bottom-0 w-full h-[800px] transform rotate-12">
            <div className="w-full h-full bg-gradient-to-r from-indigo-100/20 to-indigo-500/20" />
          </div>
          <div className="absolute -left-1/4 bottom-0 w-full h-[400px] transform rotate-12">
            <div className="w-full h-full bg-gradient-to-r from-sky-100/20 to-sky-500/20" />
          </div>
        </div>
        {/* Footer */}
        <div className="relative z-10 text-sm text-gray-500 flex space-x-4">
          <span>© {new Date().getFullYear()} Bubble.io Data Manager</span>
          <a href="#" className="hover:text-gray-900">Privacy & terms</a>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-8">
            <Database className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}