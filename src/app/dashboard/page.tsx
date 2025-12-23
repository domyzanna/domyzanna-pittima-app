'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
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
  
  useEffect(() => {
    async function seedDefaultCategories() {
      if (user && firestore && !isSeeding) {
        setIsSeeding(true);
        try {
          const categoriesColRef = collection(firestore, 'users', user.uid, 'categories');
          const existingCategories = await getDocs(categoriesColRef);
          
          if (existingCategories.empty) {
            console.log('Nessuna categoria trovata, creazione categorie di default...');
            const batch = writeBatch(firestore);
            
            defaultCategories.forEach((categoryData) => {
              const newCatRef = doc(categoriesColRef);
              batch.set(newCatRef, { ...categoryData, userId: user.uid, id: newCatRef.id });
            });
            
            await batch.commit();
            console.log('Categorie di default create con successo.');
          }
        } catch (error) {
          console.error("Errore durante la creazione delle categorie di default:", error);
        } finally {
          setIsSeeding(false);
        }
      }
    }
    
    // Run this effect only once when user and firestore are available
    if (user && firestore) {
        seedDefaultCategories();
    }
  }, [user, firestore]);

  const processedDeadlines = useMemo((): ProcessedDeadline[] => {
    if (!deadlines || !categories) {
      return [];
    }

    return deadlines
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
      .filter((d): d is ProcessedDeadline => d !== null)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [deadlines, categories]);
  
  const sortedCategories = useMemo(() => {
    if (!categories || processedDeadlines.length === 0) {
      return categories || [];
    }
  
    const categoryUrgency = new Map<string, number>();
  
    categories.forEach(cat => {
      const deadlinesForCat = processedDeadlines.filter(d => d.category.id === cat.id);
      if (deadlinesForCat.length > 0) {
        // The deadlines are already sorted, so the first one is the most urgent
        categoryUrgency.set(cat.id, deadlinesForCat[0].daysRemaining);
      } else {
        // Push categories with no deadlines to the end
        categoryUrgency.set(cat.id, Infinity);
      }
    });
  
    return [...categories].sort((a, b) => {
      const urgencyA = categoryUrgency.get(a.id) ?? Infinity;
      const urgencyB = categoryUrgency.get(b.id) ?? Infinity;
      return urgencyA - urgencyB;
    });
  }, [categories, processedDeadlines]);

  const isLoading = isLoadingCategories || isLoadingDeadlines || isSeeding;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        {(!categories || categories.length === 0) && !isSeeding && (
          <Card>
            <CardHeader>
              <CardTitle>Benvenuto in Pittima!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Sembra che tu non abbia ancora nessuna categoria.
              </p>
               <p className="mt-2">
                Le categorie di default verranno create a breve. Se non appaiono, prova a ricaricare la pagina.
              </p>
            </CardContent>
          </Card>
        )}
        {categories && categories.length > 0 && processedDeadlines.length === 0 && (
           <Card>
           <CardHeader>
             <CardTitle>Nessuna scadenza trovata</CardTitle>
           </CardHeader>
           <CardContent>
             <p>
               Non hai ancora aggiunto nessuna scadenza. Clicca su "Aggiungi Scadenza" per iniziare.
             </p>
           </CardContent>
         </Card>
        )}
        {sortedCategories &&
          sortedCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              deadlines={processedDeadlines.filter(
                (d) => d.category.id === category.id
              )}
            />
          ))}
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-8">
          <MonthlySummary deadlines={processedDeadlines} />
        </div>
      </div>
    </div>
  );
}
