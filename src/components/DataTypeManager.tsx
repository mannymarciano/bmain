import React from 'react';
import { DataType } from '../types/api';
import { MetaScanner } from './MetaScanner';
import { DataTypeList } from './DataTypeList';

interface DataTypeManagerProps {
  dataTypes: DataType[];
  url: string;
  apiKey: string;
  onToggle: (index: number) => void;
  onScanComplete: (dataTypes: string[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function DataTypeManager({
  dataTypes,
  url,
  apiKey,
  onToggle,
  onScanComplete,
  onError,
  disabled = false,
}: DataTypeManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Data Types</label>
        <MetaScanner
          url={url}
          apiKey={apiKey}
          onScanComplete={onScanComplete}
          onError={onError}
          disabled={disabled}
        />
      </div>
      
      {dataTypes.length > 0 ? (
        <DataTypeList
          dataTypes={dataTypes}
          onToggle={onToggle}
          disabled={disabled}
        />
      ) : (
        <div className="text-sm text-gray-500 italic p-2">
          Click "Scan Available Types" to load data types
        </div>
      )}
    </div>
  );
}