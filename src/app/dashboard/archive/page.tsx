'use client';
import { useMemo } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Deadline, Category } from '@/lib/types';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArchivedDeadlineCard } from '@/components/dashboard/archived-deadline-card';
import { History } from 'lucide-react';

type ArchivedDeadline = Deadline & {
    category: Category | undefined;
};

export default function ArchivePage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const categoriesQuery = useMemoFirebase(
        () => user ? collection(firestore, 'users', user.uid, 'categories') : null,
        [firestore, user]
    );
    const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

    const deadlinesQuery = useMemoFirebase(
        () => user ? query(
            collection(firestore, 'users', user.uid, 'deadlines'),
            where('isCompleted', '==', true),
            orderBy('completedAt', 'desc')
        ) : null,
        [firestore, user]
    );
    const { data: deadlines, isLoading: isLoadingDeadlines } = useCollection<Deadline>(deadlinesQuery);

    const isLoading = isLoadingCategories || isLoadingDeadlines;

    const archivedDeadlines: ArchivedDeadline[] = useMemo(() => {
        if (!deadlines || !categories) return [];
        const categoriesMap = new Map(categories.map(c => [c.id, c]));
        return deadlines.map(d => ({
            ...d,
            category: categoriesMap.get(d.categoryId),
        }));
    }, [deadlines, categories]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
                <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
                <History className="h-6 w-6"/>
                Archivio Scadenze
            </h1>
            {archivedDeadlines.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Nessuna scadenza archiviata</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Quando completerai una scadenza "una tantum", la troverai qui.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {archivedDeadlines.map((deadline) => (
                        <ArchivedDeadlineCard key={deadline.id} deadline={deadline} />
                    ))}
                </div>
            )}
        </div>
    );
}
