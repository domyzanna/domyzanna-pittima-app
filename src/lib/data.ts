import type { Deadline } from './types';
import { Car, Shield, FileText, Repeat } from 'lucide-react';
import { addDays, subDays } from 'date-fns';

const now = new Date();

export const mockDeadlines: Deadline[] = [
  // Veicoli
  {
    id: '1',
    name: 'Fiat Panda',
    category: 'Veicoli',
    categoryIcon: Car,
    expirationDate: addDays(now, 5), // Urgenza alta
    recurrence: 'annuale',
    details: { Targa: 'AB123CD', Scadenza: 'Assicurazione' },
  },
  {
    id: '2',
    name: 'Fiat Panda',
    category: 'Veicoli',
    categoryIcon: Car,
    expirationDate: addDays(now, 120), // Urgenza bassa
    recurrence: 'annuale',
    details: { Targa: 'AB123CD', Scadenza: 'Revisione' },
  },
  {
    id: '3',
    name: 'Patente di Guida',
    category: 'Veicoli',
    categoryIcon: Car,
    expirationDate: subDays(now, 15), // Scaduto
    recurrence: 'annuale',
    details: { Titolare: 'Mario Rossi' },
  },

  // Assicurazione
  {
    id: '4',
    name: 'Assicurazione Casa',
    category: 'Assicurazione',
    categoryIcon: Shield,
    expirationDate: addDays(now, 25), // Urgenza media
    recurrence: 'annuale',
    details: { 'Polizza #': 'H-98765' },
  },
  {
    id: '5',
    name: 'Assicurazione Vita',
    category: 'Assicurazione',
    categoryIcon: Shield,
    expirationDate: addDays(now, 90), // Urgenza bassa
    recurrence: 'semestrale',
    details: { 'Polizza #': 'L-54321' },
  },

  // Documenti Personali
  {
    id: '6',
    name: 'Passaporto',
    category: 'Documenti Personali',
    categoryIcon: FileText,
    expirationDate: addDays(now, 180), // Urgenza bassa
    recurrence: 'una-tantum',
    details: { 'Documento #': 'P-ABC123' },
  },
  {
    id: '7',
    name: 'Carta d\'Identità',
    category: 'Documenti Personali',
    categoryIcon: FileText,
    expirationDate: subDays(now, 90), // Scaduto
    recurrence: 'una-tantum',
    details: { 'Documento #': 'ID-XYZ789' },
  },

  // Abbonamenti
  {
    id: '8',
    name: 'Servizio Streaming',
    category: 'Abbonamenti',
    categoryIcon: Repeat,
    expirationDate: addDays(now, 2), // Urgenza alta
    recurrence: 'mensile',
    details: { Fornitore: 'NextFlix' },
  },
  {
    id: '9',
    name: 'Abbonamento Palestra',
    category: 'Abbonamenti',
    categoryIcon: Repeat,
    expirationDate: addDays(now, 45), // Urgenza bassa
    recurrence: 'trimestrale',
    details: { Sede: 'Palestra Centro' },
  },
];
