'use client';
import { useMemo } from 'react';
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  useDoc,
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { ProcessedDeadline, Category, Deadline } from '@/lib/types';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import { DeadlineCard } from '@/components/dashboard/deadline-card';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useParams } from 'next/navigation';

const getIcon = (iconName: string | undefined) => {
  if (!iconName) {
    const FallbackIcon = (LucideIcons as any)['Folder'];
    return <FallbackIcon className="h-6 w-6 text-primary" />;
  }
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="h-6 w-6 text-primary" />;
  }
  const FallbackIcon = (LucideIcons as any)['AlertCircle'];
  return <FallbackIcon className="h-6 w-6 text-destructive" />;
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. Get the category details
  const categoryRef = useMemoFirebase(
    () =>
      user
        ? doc(firestore, 'users', user.uid, 'categories', categoryId)
        : null,
    [firestore, user, categoryId]
  );
  const { data: category, isLoading: isLoadingCategory } =
    useDoc<Category>(categoryRef);

  // 2. Get the deadlines for this category
  const deadlinesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'deadlines'),
            where('categoryId', '==', categoryId)
          )
        : null,
    [firestore, user, categoryId]
  );

  const { data: deadlines, isLoading: isLoadingDeadlines } =
    useCollection<Deadline>(deadlinesQuery);

  const isLoading = isLoadingCategory || isLoadingDeadlines;

  // 3. Process the deadlines (add urgency, etc.)
  const processedDeadlines = useMemo((): ProcessedDeadline[] => {
    if (!deadlines || !category) {
      return [];
    }

    return deadlines
      .map((d) => {
        const daysRemaining = calculateDaysRemaining(
          new Date(d.expirationDate)
        );
        return {
          ...d,
          category, // We already have the category, so just attach it
          daysRemaining,
          urgency: getUrgency(daysRemaining),
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [deadlines, category]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Categoria non trovata</CardTitle>
            </CardHeader>
            <CardContent>
                <p>La categoria che stai cercando non esiste o non hai i permessi per vederla.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
        <h2 className="text-xl font-headline font-semibold mb-4 flex items-center gap-3">
            {getIcon(category?.icon)}
            {category?.name}
        </h2>
      {processedDeadlines.length === 0 ? (
         <Card>
         <CardHeader>
           <CardTitle>Nessuna scadenza trovata</CardTitle>
         </CardHeader>
         <CardContent>
           <p>
             Non hai ancora aggiunto nessuna scadenza in questa categoria.
           </p>
         </CardContent>
       </Card>
      ) : (
        <div className="grid gap-4">
        {processedDeadlines.map((deadline) => (
          <DeadlineCard key={deadline.id} deadline={deadline} />
        ))}
      </div>
      )}
    </div>
  );
}
