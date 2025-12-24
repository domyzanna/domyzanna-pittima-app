'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditDeadlineDialog } from '@/components/dashboard/edit-deadline-dialog';

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
  const [editingDeadline, setEditingDeadline] = useState<ProcessedDeadline | null>(
    null
  );

  // 1. Fetch raw data from Firestore
  const categoriesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'categories') : null,
    [firestore, user]
  );
  const deadlinesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'deadlines') : null),
    [firestore, user]
  );

  const { data: categories, isLoading: isLoadingCategories } =
    useCollection<Category>(categoriesQuery);
  const { data: deadlines, isLoading: isLoadingDeadlines } =
    useCollection<Deadline>(deadlinesQuery);

  const [isSeeding, setIsSeeding] = useState(false);

  // 2. Seed default categories, runs only once
  useEffect(() => {
    async function seedDefaultCategories() {
      if (user && firestore && categories !== null && categories.length === 0) {
        setIsSeeding(true);
        console.log(
          'Nessuna categoria trovata, creazione categorie di default...'
        );
        const categoriesColRef = collection(
          firestore,
          'users',
          user.uid,
          'categories'
        );
        const batch = writeBatch(firestore);
        defaultCategories.forEach((categoryData) => {
          const newCatRef = doc(categoriesColRef);
          batch.set(newCatRef, {
            ...categoryData,
            userId: user.uid,
            id: newCatRef.id,
          });
        });
        try {
          await batch.commit();
          console.log('Categorie di default create con successo.');
        } catch (error) {
          console.error(
            'Errore during la creazione delle categorie di default:',
            error
          );
        } finally {
          setIsSeeding(false);
        }
      }
    }
    
    // This effect runs when user, firestore, or categories change.
    // It will seed only if categories is an empty array.
    if(user && firestore && !isLoadingCategories){
        seedDefaultCategories();
    }
    
  }, [user, firestore, categories, isLoadingCategories]);

  // 3. Process data (memoized)
  const processedDeadlines = useMemo((): ProcessedDeadline[] => {
    if (!deadlines || !categories) {
      return [];
    }
    const processed = deadlines
      .map((d) => {
        const category = categories.find((c) => c.id === d.categoryId);
        if (!category) return null;
        const daysRemaining = calculateDaysRemaining(
          new Date(d.expirationDate)
        );
        return {
          ...d,
          category,
          daysRemaining,
          urgency: getUrgency(daysRemaining),
        };
      })
      .filter((d): d is ProcessedDeadline => d !== null);
      
      // IMPORTANT: Sort in place to avoid creating a new array reference if the order is the same.
      // A new sorted array instance would cause an infinite loop.
      processed.sort((a, b) => a.daysRemaining - b.daysRemaining);
      
      return processed;
  }, [deadlines, categories]);

  
  const isLoading = isLoadingCategories || isLoadingDeadlines || isSeeding;

  const handleEditDeadline = (deadline: ProcessedDeadline) => {
    setEditingDeadline(deadline);
  };

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
              <CardHeader>
                <CardTitle>Benvenuto in Pittima!</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sembra che tu non abbia ancora nessuna categoria.</p>
                <p className="mt-2">
                  Le categorie di default verranno create a breve. Se non
                  appaiono, prova a ricaricare la pagina.
                </p>
              </CardContent>
            </Card>
          )}
          {categories &&
            categories.length > 0 &&
            processedDeadlines.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nessuna scadenza trovata</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Non hai ancora aggiunto nessuna scadenza. Clicca su "Aggiungi
                    Scadenza" per iniziare.
                  </p>
                </CardContent>
              </Card>
            )}
          {categories?.map((category) => (
             <CategorySection
                key={category.id}
                category={category}
                deadlines={processedDeadlines.filter(d => d.categoryId === category.id)}
                onEditDeadline={handleEditDeadline}
              />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <MonthlySummary deadlines={processedDeadlines} />
          </div>
        </div>
      </div>

      {editingDeadline && (
        <EditDeadlineDialog
          open={!!editingDeadline}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingDeadline(null);
            }
          }}
          deadline={editingDeadline}
        />
      )}
    </>
  );
}
