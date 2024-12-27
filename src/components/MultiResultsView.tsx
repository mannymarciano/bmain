import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FetchResponse } from '../types/api';
import { ResultCard } from './ResultCard';

interface MultiResultsViewProps {
  results: FetchResponse[];
}

export function MultiResultsView({ results }: MultiResultsViewProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const toggleExpanded = (dataType: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(dataType)) {
      newExpanded.delete(dataType);
    } else {
      newExpanded.add(dataType);
    }
    setExpandedTypes(newExpanded);
  };

  return (
    <div className="mt-6 space-y-4">
      {results.map((result) => {
        const isExpanded = expandedTypes.has(result.dataType);
        
        return (
          <div key={result.dataType} className="bg-gray-50 p-4 rounded-md">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpanded(result.dataType)}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {result.dataType}
                </h3>
                <div className="text-sm text-gray-600">
                  <span>Total: {result.count}</span>
                  {result.remaining > 0 && (
                    <span className="ml-2">Remaining: {result.remaining}</span>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            {isExpanded && (
              <div className="mt-4 max-h-60 overflow-auto">
                {result.results.map((item) => (
                  <ResultCard key={item._id} data={item} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}