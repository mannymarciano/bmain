import React from 'react';
import { FetchResponse } from '../types/api';
import { ResultCard } from './ResultCard';

interface ResultsViewProps {
  data: FetchResponse;
}

export function ResultsView({ data }: ResultsViewProps) {
  return (
    <div className="mt-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
        <div className="text-sm text-gray-600 mb-4">
          <p>Total Records: {data.count}</p>
          <p>Remaining Records: {data.remaining}</p>
        </div>
        <div className="mt-4 max-h-60 overflow-auto">
          {data.results.map((item) => (
            <ResultCard key={item._id} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
}