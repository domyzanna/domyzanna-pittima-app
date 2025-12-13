import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'deadlines';

// Categorie predefinite
export const CATEGORIES = {
  VEICOLI: {
    id: 'veicoli',
    name: 'Veicoli',
    icon: '🚗',
    fields: [
      { name: 'targa', label: 'Targa', type: 'text', required: true },
      { name: 'nomeVeicolo', label: 'Nome/Modello', type: 'text', required: true },
      { name: 'tipoScadenza', label: 'Tipo Scadenza', type: 'select', required: true, 
        options: ['Assicurazione', 'Bollo', 'Revisione', 'Patente'] },
    ]
  },
  ASSICURAZIONI: {
    id: 'assicurazioni',
    name: 'Assicurazioni',
    icon: '🛡️',
    fields: [
      { name: 'nomePolizza', label: 'Nome Polizza', type: 'text', required: true },
      { name: 'tipoPolizza', label: 'Tipo', type: 'select', required: true,
        options: ['Casa', 'Vita', 'Animali', 'Salute', 'Infortuni', 'Altro'] },
      { name: 'compagnia', label: 'Compagnia', type: 'text', required: false },
    ]
  },
  DOCUMENTI: {
    id: 'documenti',
    name: 'Documenti Personali',
    icon: '📄',
    fields: [
      { name: 'tipoDocumento', label: 'Tipo Documento', type: 'select', required: true,
        options: ['Carta d\'Identità', 'Passaporto', 'Tessera Sanitaria', 'Patente', 'Altro'] },
      { name: 'intestatario', label: 'Intestatario', type: 'text', required: true },
    ]
  },
  PERSONALIZZATA: {
    id: 'personalizzata',
    name: 'Personalizzata',
    icon: '⭐',
    fields: [
      { name: 'nome', label: 'Nome Scadenza', type: 'text', required: true },
      { name: 'categoriaCustom', label: 'Categoria', type: 'text', required: false },
    ]
  }
};

// Opzioni ricorrenza
export const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'Una tantum' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'semiannual', label: 'Semestrale' },
  { value: 'annual', label: 'Annuale' }
];

// Opzioni intensità notifiche
export const NOTIFICATION_INTENSITY = [
  { value: 'light', label: 'Leggero', description: '1 avviso al giorno' },
  { value: 'medium', label: 'Medio', description: '2-3 avvisi al giorno' },
  { value: 'heavy', label: 'Martello Pneumatico', description: 'Ogni poche ore' }
];

// Calcola i giorni rimanenti
export function getDaysRemaining(expirationDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = expirationDate instanceof Timestamp 
    ? expirationDate.toDate() 
    : new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Determina il colore del semaforo
export function getUrgencyColor(daysRemaining) {
  if (daysRemaining < 0) return 'black';      // Scaduto
  if (daysRemaining <= 7) return 'red';       // Urgente
  if (daysRemaining <= 30) return 'yellow';   // Attenzione
  return 'green';                              // OK
}

// Calcola la prossima data di scadenza basata sulla ricorrenza
export function calculateNextDate(currentDate, recurrence) {
  const date = currentDate instanceof Timestamp 
    ? currentDate.toDate() 
    : new Date(currentDate);
  
  switch (recurrence) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semiannual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null; // Una tantum, non c'è prossima data
  }
  
  return date;
}

// CRUD Operations

// Crea una nuova scadenza
export async function createDeadline(userId, deadlineData) {
  const deadline = {
    ...deadlineData,
    userId,
    expirationDate: Timestamp.fromDate(new Date(deadlineData.expirationDate)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: 'active' // active, completed, archived
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), deadline);
  return docRef.id;
}

// Aggiorna una scadenza
export async function updateDeadline(deadlineId, updates) {
  const deadlineRef = doc(db, COLLECTION_NAME, deadlineId);
  
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now()
  };
  
  if (updates.expirationDate) {
    updateData.expirationDate = Timestamp.fromDate(new Date(updates.expirationDate));
  }
  
  await updateDoc(deadlineRef, updateData);
}

// Marca come aggiornata (rinnova la scadenza)
export async function renewDeadline(deadlineId, newExpirationDate) {
  await updateDeadline(deadlineId, {
    expirationDate: newExpirationDate,
    status: 'active'
  });
}

// Marca come completata/terminata
export async function completeDeadline(deadlineId) {
  await updateDeadline(deadlineId, {
    status: 'completed',
    completedAt: Timestamp.now()
  });
}

// Elimina una scadenza
export async function deleteDeadline(deadlineId) {
  const deadlineRef = doc(db, COLLECTION_NAME, deadlineId);
  await deleteDoc(deadlineRef);
}

// Listener per le scadenze dell'utente (real-time)
export function subscribeToDeadlines(userId, callback) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('expirationDate', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const deadlines = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(deadlines);
  });
}

// Raggruppa le scadenze per categoria
export function groupByCategory(deadlines) {
  const grouped = {};
  
  deadlines.forEach(deadline => {
    const category = deadline.category || 'personalizzata';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(deadline);
  });
  
  return grouped;
}
