import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, add } from 'date-fns';
import type { Recurrence, Urgency } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUrgency(days: number): Urgency {
  if (days < 0) return 'scaduto';
  if (days <= 7) return 'alta';
  if (days <= 30) return 'media';
  return 'bassa';
}

export function calculateDaysRemaining(date: Date): number {
  return differenceInDays(date, new Date());
}

export function getNextExpiration(date: Date, recurrence: Recurrence): Date {
  switch (recurrence) {
    case 'mensile':
      return add(date, { months: 1 });
    case 'trimestrale':
      return add(date, { months: 3 });
    case 'semestrale':
      return add(date, { months: 6 });
    case 'annuale':
      return add(date, { years: 1 });
    case 'una-tantum':
    default:
      return date;
  }
}
