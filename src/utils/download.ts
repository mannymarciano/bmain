import { BubbleEntity } from '../types/api';
import { formatDate, formatValue, getDisplayName, shouldDisplayField } from './formatters';

export function convertToCSV(data: BubbleEntity[]): string {
  if (data.length === 0) return '';
  
  // Get all unique keys from all objects
  const allKeys = Array.from(new Set(
    data.flatMap(item => Object.keys(item))
  )).filter(shouldDisplayField).sort();

  const headers = allKeys.map(getDisplayName);
  
  const rows = data.map(item => {
    return allKeys.map(key => {
      const value = item[key];
      const formattedValue = key.toLowerCase().includes('date')
        ? formatDate(value)
        : formatValue(value);
      return JSON.stringify(formattedValue);
    }).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

export function downloadData(data: BubbleEntity[], format: 'json' | 'csv'): void {
  const content = format === 'json' 
    ? JSON.stringify(data, null, 2)
    : convertToCSV(data);

  const blob = new Blob([content], { 
    type: format === 'json' ? 'application/json' : 'text/csv' 
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bubble-data.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
}