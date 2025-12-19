'use client';
import { useMemo, useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Memoize Firestore queries to prevent re-renders
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const deadlinesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'deadlines') : null),
    [firestore, user]
  );

  // Fetch data using the hooks
  const { data: categories, isLoading: isLoadingCategories } =
    useCollection<Category>(categoriesQuery);
  const { data: deadlines, isLoading: isLoadingDeadlines } =
    useCollection<Deadline>(deadlinesQuery);

  const isLoading = isLoadingCategories || isLoadingDeadlines;

  const processedDeadlines = useMemo((): ProcessedDeadline[] => {
    if (!deadlines || !categories) {
      return [];
    }

    return deadlines
      .map((d) => {
        const category = categories.find((c) => c.id === d.categoryId);
        if (!category) return null; // Or handle as 'Uncategorized'

        const daysRemaining = calculateDaysRemaining(new Date(d.expirationDate));
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
        {(!categories || categories.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Benvenuto in Pittima!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Non hai ancora nessuna categoria. Le categorie ti aiutano a
                organizzare le tue scadenze.
              </p>
              <p className="mt-2">
                Le categorie di default verranno create al primo avvio, oppure puoi crearne di nuove in autonomia.
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
