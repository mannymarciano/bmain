import React, { useState, useEffect } from 'react';
import { MultiDataTypeState } from '../types/api';
import { ScheduledFetch, SchedulerStats, ScheduleOption } from '../types/scheduler';
import { fetchBubbleData } from '../utils/api';
import { downloadData } from '../utils/download';
import { createSchedule, updateSchedule } from '../utils/scheduler';

interface DataFetcherProps {
  children: (props: {
    state: MultiDataTypeState;
    schedule: ScheduledFetch | null;
    stats: SchedulerStats;
    loading: boolean;
    error: string | null;
    results: any[];
    format: 'json' | 'csv';
    onStateChange: (state: Partial<MultiDataTypeState>) => void;
    onToggleDataType: (index: number) => void;
    onScanComplete: (dataTypes: string[]) => void;
    onScheduleStart: (minutes: ScheduleOption) => void;
    onScheduleStop: () => void;
    onFormatChange: (format: 'json' | 'csv') => void;
    onDownload: () => void;
    onError: (error: string) => void;
  }) => React.ReactNode;
}

export function DataFetcher({ children }: DataFetcherProps) {
  const [state, setState] = useState<MultiDataTypeState>({
    url: '',
    apiKey: '',
    dataTypes: [],
    format: 'json'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<ScheduledFetch | null>(null);
  const [stats, setStats] = useState<SchedulerStats>({
    totalFetches: 0,
    lastFetchStatus: null,
    errorCount: 0
  });

  const handleFetch = async () => {
    if (!state.url || !state.apiKey) {
      setError('URL and API Key are required');
      return;
    }

    const activeDataTypes = state.dataTypes.filter(dt => dt.isActive);
    if (activeDataTypes.length === 0) {
      setError('At least one data type must be selected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchPromises = activeDataTypes.map(async ({ name }) => {
        const response = await fetchBubbleData({
          baseUrl: state.url,
          apiKey: state.apiKey,
          dataType: name
        });
        return { ...response, dataType: name };
      });

      const results = await Promise.all(fetchPromises);
      setResults(results);
      
      setStats(prev => ({
        ...prev,
        totalFetches: prev.totalFetches + 1,
        lastFetchStatus: 'success'
      }));

      if (schedule?.isActive) {
        setSchedule(updateSchedule(schedule));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setStats(prev => ({
        ...prev,
        lastFetchStatus: 'error',
        errorCount: prev.errorCount + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleStart = (interval: ScheduleOption) => {
    setSchedule(createSchedule(interval));
  };

  const handleScheduleStop = () => {
    setSchedule(null);
  };

  const handleDownload = () => {
    if (results.length > 0) {
      const allData = results.flatMap(r => 
        r.results.map((item: any) => ({ ...item, _dataType: r.dataType }))
      );
      downloadData(allData, state.format);
    }
  };

  const handleStateChange = (newState: Partial<MultiDataTypeState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleToggleDataType = (index: number) => {
    setState(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.map((dt, i) => 
        i === index ? { ...dt, isActive: !dt.isActive } : dt
      )
    }));
  };

  useEffect(() => {
    if (schedule?.isActive && schedule.nextFetch) {
      const timer = setInterval(() => {
        const now = new Date();
        if (now >= schedule.nextFetch) {
          handleFetch();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [schedule]);

  return children({
    state,
    schedule,
    stats,
    loading,
    error,
    results,
    format: state.format,
    onStateChange: handleStateChange,
    onToggleDataType: handleToggleDataType,
    onScanComplete: (dataTypes: string[]) => {
      setState(prev => ({
        ...prev,
        dataTypes: dataTypes.map(name => ({ name, isActive: true }))
      }));
    },
    onScheduleStart: handleScheduleStart,
    onScheduleStop: handleScheduleStop,
    onFormatChange: (format: 'json' | 'csv') => setState(prev => ({ ...prev, format })),
    onDownload: handleDownload,
    onError: setError
  });
}