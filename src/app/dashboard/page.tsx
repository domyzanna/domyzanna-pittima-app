'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const [isSeeding, setIsSeeding] = useState(true);
  
  useEffect(() => {
    // This effect runs only when the component mounts and the initial category loading state changes.
    // It's designed to prevent re-running on every category data update.
    if (!isLoadingCategories) {
      async function seedDefaultCategories() {
        if (user && firestore && categories?.length === 0) {
          console.log('Nessuna categoria trovata, creazione categorie di default...');
          setIsSeeding(true); // Set seeding state
          const batch = writeBatch(firestore);
          const categoriesColRef = collection(firestore, 'users', user.uid, 'categories');

          defaultCategories.forEach((categoryData) => {
            const newCatRef = doc(categoriesColRef); // Create ref with a new ID
            batch.set(newCatRef, { ...categoryData, userId: user.uid, id: newCatRef.id });
          });

          try {
            await batch.commit();
            console.log('Categorie di default create con successo.');
          } catch (error) {
            console.error("Errore durante la creazione delle categorie di default:", error);
          } finally {
            setIsSeeding(false); // Done seeding
          }
        } else {
          setIsSeeding(false); // No seeding needed or possible
        }
      }
      seedDefaultCategories();
    }
  }, [isLoadingCategories, user, firestore]); // Depend only on loading state and user/db availability


  const handleCleanDuplicates = async () => {
    if (!user || !firestore) return;

    toast({
      title: 'Pulizia in corso...',
      description: 'Sto cercando e rimuovendo le categorie duplicate.',
    });

    const categoryNameToClean = 'Concerti ed Eventi';
    const q = query(
      collection(firestore, 'users', user.uid, 'categories'),
      where('name', '==', categoryNameToClean)
    );

    try {
      const snapshot = await getDocs(q);
      if (snapshot.size <= 1) {
        toast({
          title: 'Nessun duplicato trovato',
          description: `Non sono state trovate categorie duplicate per "${categoryNameToClean}".`,
        });
        return;
      }

      // Keep the first one, delete the rest
      const docsToDelete = snapshot.docs.slice(1);
      const batch = writeBatch(firestore);
      docsToDelete.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      toast({
        title: 'Pulizia completata!',
        description: `${docsToDelete.length} categorie duplicate sono state rimosse con successo.`,
      });
    } catch (error) {
      console.error('Errore durante la pulizia dei duplicati:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Si è verificato un errore durante la pulizia dei duplicati.',
      });
    }
  };


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
        <Button onClick={handleCleanDuplicates} variant="destructive" className="mb-4">
          Pulisci Categorie Duplicate (Temporaneo)
        </Button>
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
        {categories &&
          categories.map((category) => (
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
