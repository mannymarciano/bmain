import { TimeZone, TimezoneOption } from '../types/settings';

// Standard timezone list with offsets
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC+00:00 (UTC)', offset: 0 },
  { value: 'GMT', label: 'GMT+00:00 (GMT)', offset: 0 },
  { value: 'EST', label: 'UTC-05:00 (EST)', offset: -5 },
  { value: 'EDT', label: 'UTC-04:00 (EDT)', offset: -4 },
  { value: 'CST', label: 'UTC-06:00 (CST)', offset: -6 },
  { value: 'CDT', label: 'UTC-05:00 (CDT)', offset: -5 },
  { value: 'MST', label: 'UTC-07:00 (MST)', offset: -7 },
  { value: 'MDT', label: 'UTC-06:00 (MDT)', offset: -6 },
  { value: 'PST', label: 'UTC-08:00 (PST)', offset: -8 },
  { value: 'PDT', label: 'UTC-07:00 (PDT)', offset: -7 },
  { value: 'AEST', label: 'UTC+10:00 (AEST)', offset: 10 },
  { value: 'AEDT', label: 'UTC+11:00 (AEDT)', offset: 11 },
  { value: 'AWST', label: 'UTC+08:00 (AWST)', offset: 8 },
  { value: 'CET', label: 'UTC+01:00 (CET)', offset: 1 },
  { value: 'CEST', label: 'UTC+02:00 (CEST)', offset: 2 },
  { value: 'IST', label: 'UTC+05:30 (IST)', offset: 5.5 },
  { value: 'CST-CN', label: 'UTC+08:00 (CST)', offset: 8 },
  { value: 'JST', label: 'UTC+09:00 (JST)', offset: 9 },
];

export async function detectUserTimezone(): Promise<TimeZone> {
  try {
    // Get system timezone
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get user's location based on IP
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Find the closest matching timezone from our standard list
    const offset = -(new Date().getTimezoneOffset() / 60);
    const closestTimezone = TIMEZONE_OPTIONS.find(tz => tz.offset === offset) || TIMEZONE_OPTIONS[0];
    
    return {
      timezone: closestTimezone.value,
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      offset
    };
  } catch (error) {
    // Fallback to UTC if location detection fails
    return {
      timezone: 'UTC',
      country: 'Unknown',
      countryCode: 'UN',
      city: 'Unknown',
      offset: 0
    };
  }
}

export function formatTimezoneOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '';
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.abs((offset % 1) * 60);
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}