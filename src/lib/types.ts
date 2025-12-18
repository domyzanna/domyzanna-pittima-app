import type { LucideIcon } from 'lucide-react';

export type Category =
  | 'Vehicles'
  | 'Insurance'
  | 'Personal Documents'
  | 'Subscriptions';

export type Recurrence =
  | 'one-time'
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual';

export type Urgency = 'expired' | 'high' | 'medium' | 'low';

export type Deadline = {
  id: string;
  name: string;
  category: Category;
  categoryIcon: LucideIcon;
  expirationDate: Date;
  recurrence: Recurrence;
  details: Record<string, string>;
};

export type ProcessedDeadline = Deadline & {
  urgency: Urgency;
  daysRemaining: number;
};
