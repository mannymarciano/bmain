export type ScheduleOption = 1 | 2 | 5;

export interface ScheduledFetch {
  interval: ScheduleOption;
  isActive: boolean;
  lastFetch: Date | null;
  nextFetch: Date | null;
}

export interface SchedulerStats {
  totalFetches: number;
  lastFetchStatus: 'success' | 'error' | null;
  errorCount: number;
}