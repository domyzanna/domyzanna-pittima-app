import type { LucideIcon } from 'lucide-react';

export type Recurrence =
  | 'una-tantum'
  | 'mensile'
  | 'bimestrale'
  | 'trimestrale'
  | 'quadrimestrale'
  | 'semestrale'
  | 'annuale';

export type Urgency = 'scaduto' | 'alta' | 'media' | 'bassa';

export type NotificationStatus = 'pending' | 'active' | 'paused';

// Firestore document for a user's category
export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string; // lucide-react icon name
};

// This represents the user document stored in /users/{userId}
export type User = {
  id: string; // This will be the Firebase Auth UID
  email: string | null;
  displayName: string | null;
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
  notificationDays: number;
  notificationStartDate: string; // ISO 8601 format
  notificationStatus: NotificationStatus;
};

// Type for client-side processing, combining deadline with its category info
export type ProcessedDeadline = Omit<Deadline, 'categoryId'> & {
  category: Category;
  urgency: Urgency;
  daysRemaining: number;
};
