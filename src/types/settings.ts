export interface TimeZone {
  timezone: string;
  country: string;
  countryCode: string;
  city: string;
  offset: number;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: number;
}

export interface ProjectTimezone {
  projectId: string;
  timezone: string;
  updatedAt: string;
}