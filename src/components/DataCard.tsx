import React from 'react';
import { CheckCircle, XCircle, Calendar, Database } from 'lucide-react';
import { FetchResponse } from '../types/api';

interface DataCardProps {
  fetch: FetchResponse;
  onClick: () => void;
}

export function DataCard({ fetch, onClick }: DataCardProps) {
  const timestamp = new Date().toLocaleString();
  const isSuccess = true; // You might want to add this to your FetchResponse type

  return (
    <div
      onClick={onClick}
      className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-indigo-600 mr-2" />
          <span className="font-medium text-gray-900">{fetch.dataType}</span>
        </div>
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {timestamp}
        </div>
        <div>
          Records: {fetch.count}
          {fetch.remaining > 0 && ` (${fetch.remaining} remaining)`}
        </div>
      </div>
    </div>
  );
}