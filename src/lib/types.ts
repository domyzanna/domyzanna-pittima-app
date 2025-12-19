import type { LucideIcon } from 'lucide-react';

export type Category =
  | 'Veicoli'
  | 'Assicurazione'
  | 'Documenti Personali'
  | 'Abbonamenti';

export type Recurrence =
  | 'una-tantum'
  | 'mensile'
  | 'trimestrale'
  | 'semestrale'
  | 'annuale';

export type Urgency = 'scaduto' | 'alta' | 'media' | 'bassa';

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
