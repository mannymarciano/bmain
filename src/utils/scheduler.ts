import { ScheduleOption, ScheduledFetch } from '../types/scheduler';

export function calculateNextFetchTime(minutes: ScheduleOption): Date {
  const nextFetch = new Date();
  nextFetch.setMinutes(nextFetch.getMinutes() + minutes);
  return nextFetch;
}

export function createSchedule(interval: ScheduleOption): ScheduledFetch {
  return {
    interval,
    isActive: true,
    lastFetch: null,
    nextFetch: calculateNextFetchTime(interval)
  };
}

export function updateSchedule(schedule: ScheduledFetch): ScheduledFetch {
  return {
    ...schedule,
    lastFetch: new Date(),
    nextFetch: calculateNextFetchTime(schedule.interval)
  };
}