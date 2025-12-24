'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditDeadlineDialog } from '@/components/dashboard/edit-deadline-dialog';
import { DeleteConfirmationDialog } from '@/components/dashboard/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';

const defaultCategories: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Veicoli', icon: 'Car' },
  { name: 'Assicurazioni', icon: 'Shield' },
  { name: 'Documenti Personali', icon: 'FileText' },
  { name: 'Abbonamenti', icon: 'Repeat' },
  { name: 'Casa', icon: 'Home' },
  { name: 'Tasse e Pagamenti', icon: 'Landmark' },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // --- STATE MANAGEMENT ---
  const [editingDeadline, setEditingDeadline] = useState<ProcessedDeadline | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string; type: 'deadline' } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);


  // --- DATA FETCHING ---
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const deadlinesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'deadlines') : null),
    [firestore, user]
  );

  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);
  const { data: deadlines, isLoading: isLoadingDeadlines } = useCollection<Deadline>(deadlinesQuery);

  // --- DATA PROCESSING ---
   const processedDeadlines = useMemo((): ProcessedDeadline[] => {
    if (!deadlines || !categories) return [];
    
    const processed = deadlines.map((d) => {
        const category = categories.find((c) => c.id === d.categoryId);
        if (!category) return null;
        const daysRemaining = calculateDaysRemaining(new Date(d.expirationDate));
        return {
          ...d,
          category,
          daysRemaining,
          urgency: getUrgency(daysRemaining),
        };
      })
      .filter((d): d is ProcessedDeadline => d !== null);

    return processed;
  }, [deadlines, categories]);
  
  const sortedDeadlines = useMemo(() => {
    return [...processedDeadlines].sort((a, b) => {
        // Primary sort: by days remaining (ascending)
        if (a.daysRemaining < b.daysRemaining) return -1;
        if (a.daysRemaining > b.daysRemaining) return 1;
        
        // Secondary sort: by name (alphabetical) if days are equal
        return a.name.localeCompare(b.name);
    });
  }, [processedDeadlines]);


  // --- SEEDING LOGIC ---
  useEffect(() => {
    async function seedDefaultCategories() {
      if (user && firestore && !isLoadingCategories && categories?.length === 0 && !isSeeding) {
        setIsSeeding(true);
        console.log('Nessuna categoria trovata, creazione categorie di default...');
        const categoriesColRef = collection(firestore, 'users', user.uid, 'categories');
        const batch = writeBatch(firestore);
        defaultCategories.forEach((categoryData) => {
          const newCatRef = doc(categoriesColRef);
          batch.set(newCatRef, { ...categoryData, userId: user.uid, id: newCatRef.id });
        });
        try {
          await batch.commit();
          console.log('Categorie di default create con successo.');
        } catch (error) {
          console.error('Errore during la creazione delle categorie di default:', error);
        } finally {
          setIsSeeding(false);
        }
      }
    }
    seedDefaultCategories();
  }, [user, firestore, categories, isLoadingCategories, isSeeding]);


  // --- EVENT HANDLERS ---
  const handleEditDeadline = (deadline: ProcessedDeadline) => {
    setEditingDeadline(deadline);
  };

  const handleDeleteDeadline = (deadline: ProcessedDeadline) => {
    setDeletingItem({ id: deadline.id, name: deadline.name, type: 'deadline' });
  };
  
  const confirmDeletion = () => {
    if (!deletingItem || !user || !firestore) return;

    if (deletingItem.type === 'deadline') {
        const docRef = doc(firestore, 'users', user.uid, 'deadlines', deletingItem.id);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Successo!',
            description: `"${deletingItem.name}" è stato eliminato.`,
        });
    } 

    setDeletingItem(null);
  };


  const isLoading = isLoadingCategories || isLoadingDeadlines || isSeeding;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {(!categories || categories.length === 0) && !isSeeding && (
            <Card>
              <CardHeader><CardTitle>Benvenuto in Pittima!</CardTitle></CardHeader>
              <CardContent>
                <p>Sembra che tu non abbia ancora nessuna categoria. Le categorie di default verranno create a breve.</p>
              </CardContent>
            </Card>
          )}
          {categories && categories.length > 0 && sortedDeadlines.length === 0 && (
            <Card>
              <CardHeader><CardTitle>Nessuna scadenza trovata</CardTitle></CardHeader>
              <CardContent>
                <p>Non hai ancora aggiunto nessuna scadenza. Clicca su "Aggiungi Scadenza" per iniziare.</p>
              </CardContent>
            </Card>
          )}
          {categories?.map((category) => (
             <CategorySection
                key={category.id}
                category={category}
                deadlines={sortedDeadlines.filter(d => d.categoryId === category.id)}
                onEditDeadline={handleEditDeadline}
                onDeleteDeadline={handleDeleteDeadline}
              />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <MonthlySummary deadlines={sortedDeadlines} />
          </div>
        </div>
      </div>

      {/* --- DIALOGS --- */}
      {editingDeadline && (
        <EditDeadlineDialog
          open={!!editingDeadline}
          onOpenChange={(isOpen) => !isOpen && setEditingDeadline(null)}
          deadline={editingDeadline}
        />
      )}
      {deletingItem && (
         <DeleteConfirmationDialog
            open={!!deletingItem}
            onOpenChange={(isOpen) => !isOpen && setDeletingItem(null)}
            itemName={deletingItem.name}
            onConfirm={confirmDeletion}
        />
      )}
    </>
  );
}
