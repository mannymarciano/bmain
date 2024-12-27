import React from 'react';
import { FileJson, FileType2 } from 'lucide-react';

interface FormatSelectorProps {
  format: 'json' | 'csv';
  onChange: (format: 'json' | 'csv') => void;
  disabled?: boolean;
}

export function FormatSelector({ format, onChange, disabled = false }: FormatSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Download Format
      </label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            checked={format === 'json'}
            onChange={() => onChange('json')}
            disabled={disabled}
            className="mr-2"
          />
          <FileJson className="w-4 h-4 mr-1" />
          JSON
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={format === 'csv'}
            onChange={() => onChange('csv')}
            disabled={disabled}
            className="mr-2"
          />
          <FileType2 className="w-4 h-4 mr-1" />
          CSV
        </label>
      </div>
    </div>
  );
}