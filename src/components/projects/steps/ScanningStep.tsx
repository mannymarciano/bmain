import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { ProjectFormData } from '../../../types/project';
import { fetchBubbleMetadata } from '../../../utils/metadata';

interface ScanningStepProps {
  formData: ProjectFormData;
  onUpdate: (data: ProjectFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ScanStatus {
  message: string;
  code: 'init' | 'connecting' | 'opening' | 'scanning' | 'complete' | 'error';
  isComplete?: boolean;
}

export function ScanningStep({ formData, onUpdate, onNext, onBack }: ScanningStepProps) {
  const [currentStatus, setCurrentStatus] = useState<ScanStatus>({
    message: 'Initializing connection...',
    code: 'init'
  });
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function performScan() {
      try {
        // Step 1: Initialize
        if (mounted) {
          setCurrentStatus({
            message: 'Initializing connection...',
            code: 'connecting'
          });
        }
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 2: Connect
        if (mounted) {
          setCurrentStatus({
            message: 'Connecting to Bubble.io...',
            code: 'opening'
          });
        }
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 3: Scan
        if (mounted) {
          setCurrentStatus({
            message: 'Scanning data tables...',
            code: 'scanning'
          });
        }

        // Actual API call to get data types
        const dataTypes = await fetchBubbleMetadata(formData.appUrl, formData.apiKey);
        
        if (mounted) {
          const count = dataTypes.length;
          setCurrentStatus({
            message: `${count} data ${count === 1 ? 'table' : 'tables'} found`,
            code: 'complete',
            isComplete: true
          });
          setScanComplete(true);
          onUpdate({
            ...formData,
            dataTypes
          });
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to scan data tables';
          setError(errorMessage);
          setCurrentStatus({
            message: 'Scan failed',
            code: 'error'
          });
        }
      }
    }

    performScan();

    return () => {
      mounted = false;
    };
  }, [formData.appUrl, formData.apiKey]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center">
            {currentStatus.code === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
            ) : (
              <Loader2 className={`w-5 h-5 mr-3 ${scanComplete ? 'text-green-500' : 'text-indigo-500 animate-spin'}`} />
            )}
            <pre className="text-sm font-mono text-gray-700">{currentStatus.message}</pre>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          {scanComplete && (
            <div className="pt-4">
              <div className="h-2 bg-green-200 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!scanComplete}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}