import React, { useState } from 'react';
import { Scan, Loader2, AlertTriangle } from 'lucide-react';
import { MetaScannerProps } from '../types/api';
import { fetchBubbleMetadata } from '../utils/api/bubbleMetadataApi';
import { validateBubbleCredentials } from '../utils/validation/bubbleValidation';

export function MetaScanner({ 
  url, 
  apiKey, 
  onScanComplete, 
  onError,
  disabled = false 
}: MetaScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      setScanning(true);
      setError(null);

      // Validate inputs first
      const validation = validateBubbleCredentials(url, apiKey);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid credentials');
      }

      const dataTypes = await fetchBubbleMetadata(url, apiKey);
      onScanComplete(dataTypes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan metadata';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleScan}
        disabled={disabled || scanning}
        className="flex items-center justify-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanning ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Scan className="w-4 h-4 mr-1" />
            Scan Available Types
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}