import type { LucideIcon } from 'lucide-react';

export type Recurrence =
  | 'una-tantum'
  | 'mensile'
  | 'trimestrale'
  | 'semestrale'
  | 'annuale';

export type Urgency = 'scaduto' | 'alta' | 'media' | 'bassa';

// Firestore document for a user's category
export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string; // lucide-react icon name
};

// Firestore document for a user's deadline
export type Deadline = {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  description?: string;
  expirationDate: string; // ISO 8601 format
  recurrence: Recurrence;
  isCompleted: boolean;
};

// Type for client-side processing, combining deadline with its category info
export type ProcessedDeadline = Omit<Deadline, 'categoryId'> & {
  category: Category;
  urgency: Urgency;
  daysRemaining: number;
};
