import type { Deadline } from './types';
import { Car, Shield, FileText, Repeat } from 'lucide-react';
import { addDays, subDays } from 'date-fns';

const now = new Date();

export const mockDeadlines: Deadline[] = [
  // Vehicles
  {
    id: '1',
    name: 'Fiat Panda',
    category: 'Vehicles',
    categoryIcon: Car,
    expirationDate: addDays(now, 5), // High urgency
    recurrence: 'annual',
    details: { 'License Plate': 'AB123CD', Due: 'Insurance' },
  },
  {
    id: '2',
    name: 'Fiat Panda',
    category: 'Vehicles',
    categoryIcon: Car,
    expirationDate: addDays(now, 120), // Low urgency
    recurrence: 'annual',
    details: { 'License Plate': 'AB123CD', Due: 'Technical Inspection' },
  },
  {
    id: '3',
    name: "Driver's License",
    category: 'Vehicles',
    categoryIcon: Car,
    expirationDate: subDays(now, 15), // Expired
    recurrence: 'annual',
    details: { Holder: 'John Doe' },
  },

  // Insurance
  {
    id: '4',
    name: 'Home Insurance',
    category: 'Insurance',
    categoryIcon: Shield,
    expirationDate: addDays(now, 25), // Medium urgency
    recurrence: 'annual',
    details: { 'Policy #': 'H-98765' },
  },
  {
    id: '5',
    name: 'Life Insurance',
    category: 'Insurance',
    categoryIcon: Shield,
    expirationDate: addDays(now, 90), // Low urgency
    recurrence: 'semi-annual',
    details: { 'Policy #': 'L-54321' },
  },

  // Personal Documents
  {
    id: '6',
    name: 'Passport',
    category: 'Personal Documents',
    categoryIcon: FileText,
    expirationDate: addDays(now, 180), // Low urgency
    recurrence: 'one-time',
    details: { 'Document #': 'P-ABC123' },
  },
  {
    id: '7',
    name: 'ID Card',
    category: 'Personal Documents',
    categoryIcon: FileText,
    expirationDate: subDays(now, 90), // Expired
    recurrence: 'one-time',
    details: { 'Document #': 'ID-XYZ789' },
  },

  // Subscriptions
  {
    id: '8',
    name: 'Streaming Service',
    category: 'Subscriptions',
    categoryIcon: Repeat,
    expirationDate: addDays(now, 2), // High urgency
    recurrence: 'monthly',
    details: { Provider: 'NextFlix' },
  },
  {
    id: '9',
    name: 'Gym Membership',
    category: 'Subscriptions',
    categoryIcon: Repeat,
    expirationDate: addDays(now, 45), // Low urgency
    recurrence: 'quarterly',
    details: { Location: 'Downtown Fitness' },
  },
];
