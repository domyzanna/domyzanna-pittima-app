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
import ClientDashboardHeader from '@/components/dashboard/client-dashboard-header';

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

  const [dialogState, setDialogState] = useState<{
    editingDeadline?: ProcessedDeadline;
    deletingDeadline?: ProcessedDeadline;
  }>({});

  const [isSeeding, setIsSeeding] = useState(false);

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
      .filter((d): d is ProcessedDeadline => d !== null);
  }, [deadlines, categories]);

  const sortedDeadlines = useMemo(() => {
    return [...processedDeadlines].sort((a, b) => {
      if (a.daysRemaining < b.daysRemaining) return -1;
      if (a.daysRemaining > b.daysRemaining) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [processedDeadlines]);

  const deadlinesByCategory = useMemo(() => {
    return sortedDeadlines.reduce(
      (acc, deadline) => {
        if (!acc[deadline.category.id]) {
          acc[deadline.category.id] = [];
        }
        acc[deadline.category.id].push(deadline);
        return acc;
      },
      {} as Record<string, ProcessedDeadline[]>
    );
  }, [sortedDeadlines]);

  const sortedCategories = useMemo(() => {
    if (!categories || sortedDeadlines.length === 0) {
      return categories || [];
    }

    const categoryOrder = sortedDeadlines.map((d) => d.category.id);
    const uniqueCategoryOrder = [...new Set(categoryOrder)];

    const sorted = [...categories].sort((a, b) => {
      const indexA = uniqueCategoryOrder.indexOf(a.id);
      const indexB = uniqueCategoryOrder.indexOf(b.id);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    return sorted;
  }, [categories, sortedDeadlines]);

  useEffect(() => {
    async function seedDefaultCategories() {
      if (
        user &&
        firestore &&
        !isLoadingCategories &&
        categories?.length === 0 &&
        !isSeeding
      ) {
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
    seedDefaultCategories();
  }, [user, firestore, categories, isLoadingCategories, isSeeding]);

  const handleEditDeadline = (deadline: ProcessedDeadline) => {
    setDialogState({ editingDeadline: deadline });
  };

  const handleDeleteDeadline = (deadline: ProcessedDeadline) => {
    setDialogState({ deletingDeadline: deadline });
  };

  const confirmDeletion = () => {
    const { deletingDeadline } = dialogState;
    if (!deletingDeadline || !user || !firestore) return;

    const docRef = doc(
      firestore,
      'users',
      user.uid,
      'deadlines',
      deletingDeadline.id
    );
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Successo!',
      description: `"${deletingDeadline.name}" è stato eliminato.`,
    });

    setDialogState({});
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
      <ClientDashboardHeader totalDeadlines={sortedDeadlines.length} />
      <main className="py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-2 space-y-8">
            {(!categories || categories.length === 0) && !isSeeding && (
              <Card>
                <CardHeader>
                  <CardTitle>Benvenuto in Pittima!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Sembra che tu non abbia ancora nessuna categoria. Le categorie
                    di default verranno create a breve.
                  </p>
                </CardContent>
              </Card>
            )}
            {categories &&
              categories.length > 0 &&
              sortedDeadlines.length === 0 && (
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
            {sortedCategories?.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                deadlines={deadlinesByCategory[category.id] || []}
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
      </main>

      {dialogState.editingDeadline && (
        <EditDeadlineDialog
          open={!!dialogState.editingDeadline}
          onOpenChange={(isOpen) => !isOpen && setDialogState({})}
          deadline={dialogState.editingDeadline}
        />
      )}
      {dialogState.deletingDeadline && (
        <DeleteConfirmationDialog
          open={!!dialogState.deletingDeadline}
          onOpenChange={(isOpen) => !isOpen && setDialogState({})}
          itemName={dialogState.deletingDeadline.name}
          onConfirm={confirmDeletion}
        />
      )}
    </>
  );
}
