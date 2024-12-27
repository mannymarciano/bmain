export type PlanTier = 'hobby' | 'pro' | 'enterprise';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  features: string[];
  limits: {
    projects: number;
    backupsPerDay: number;
    retentionDays: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}