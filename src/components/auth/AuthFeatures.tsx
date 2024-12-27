import React from 'react';
import { Zap, Globe, Users } from 'lucide-react';

export function AuthFeatures() {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-indigo-600" />,
      title: 'Get started quickly',
      description: 'Connect your Bubble.io app and start backing up your data in minutes.',
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      title: 'Support any app size',
      description: 'From small projects to enterprise apps, we handle data backup at any scale.',
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      title: 'Join hundreds of developers',
      description: 'Join other Bubble.io developers who trust us with their data backups.',
    },
  ];

  return (
    <div className="mt-16 space-y-10">
      {features.map((feature, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0">{feature.icon}</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-base text-gray-500">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}