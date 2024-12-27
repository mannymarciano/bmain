import React from 'react';
import { DataType } from '../types/api';

interface DataTypeListProps {
  dataTypes: DataType[];
  onToggle: (index: number) => void;
  disabled?: boolean;
}

export function DataTypeList({ dataTypes, onToggle, disabled = false }: DataTypeListProps) {
  return (
    <div className="space-y-2">
      {dataTypes.map((dataType, index) => (
        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <input
            type="checkbox"
            checked={dataType.isActive}
            onChange={() => onToggle(index)}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">{dataType.name}</span>
        </div>
      ))}
    </div>
  );
}