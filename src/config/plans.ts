import { Plan } from '../types/subscription';

export const TRIAL_PERIOD_DAYS = 10;

export const plans: Plan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    tier: 'hobby',
    price: 9,
    features: [
      'Up to 3 projects',
      'Daily backups',
      '30 days retention',
      'Basic support'
    ],
    limits: {
      projects: 3,
      backupsPerDay: 1,
      retentionDays: 30
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    tier: 'pro',
    price: 29,
    features: [
      'Up to 10 projects',
      'Hourly backups',
      '90 days retention',
      'Priority support',
      'Advanced analytics'
    ],
    limits: {
      projects: 10,
      backupsPerDay: 24,
      retentionDays: 90
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99,
    features: [
      'Unlimited projects',
      'Custom backup schedule',
      '1 year retention',
      '24/7 support',
      'Custom features',
      'Dedicated account manager'
    ],
    limits: {
      projects: -1, // unlimited
      backupsPerDay: -1, // unlimited
      retentionDays: 365
    }
  }
];