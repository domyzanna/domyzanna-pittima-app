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
    case 'bimestrale':
      return add(date, { months: 2 });
    case 'trimestrale':
      return add(date, { months: 3 });
    case 'quadrimestrale':
      return add(date, { months: 4 });
    case 'semestrale':
      return add(date, { months: 6 });
    case 'annuale':
      return add(date, { years: 1 });
    case 'una-tantum':
    default:
      return date;
  }
}

export function detectBrowser(): 'chrome' | 'safari-ios' | 'safari-mac' | 'firefox' | 'edge' | 'samsung' | 'other' {
  if (typeof window === 'undefined') return 'other';
  
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isMac = /macintosh/.test(ua) && !('ontouchend' in document);
  const isSamsung = /samsungbrowser/.test(ua);
  const isEdge = /edg\//.test(ua);
  const isFirefox = /firefox/.test(ua) && !/seamonkey/.test(ua);
  const isChrome = /chrome/.test(ua) && !/edg\//.test(ua) && !/samsungbrowser/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);

  if (isSamsung) return 'samsung';
  if (isEdge) return 'edge';
  if (isIOS && isSafari) return 'safari-ios';
  if (isMac && isSafari) return 'safari-mac';
  if (isFirefox) return 'firefox';
  if (isChrome) return 'chrome';
  return 'other';
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}
