import React from 'react';
import { BubbleEntity } from '../types/api';
import { formatDate, formatValue, getDisplayName, shouldDisplayField } from '../utils/formatters';

interface ResultCardProps {
  data: BubbleEntity;
}

export function ResultCard({ data }: ResultCardProps) {
  const fields = Object.entries(data)
    .filter(([key]) => shouldDisplayField(key))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mb-4 p-4 bg-white rounded-md shadow-sm">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map(([key, value]) => {
          const displayValue = key.toLowerCase().includes('date') 
            ? formatDate(value)
            : formatValue(value);

          return (
            <div key={key}>
              <span className="font-medium">{getDisplayName(key)}:</span>{' '}
              {displayValue}
            </div>
          );
        })}
      </div>
    </div>
  );
}