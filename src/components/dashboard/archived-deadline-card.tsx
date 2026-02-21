'use client';
import type { Deadline, Category } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Undo } from 'lucide-react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, deleteField } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type ArchivedDeadline = Deadline & {
    category: Category | undefined;
}

type ArchivedDeadlineCardProps = {
    deadline: ArchivedDeadline;
};

export function ArchivedDeadlineCard({ deadline }: ArchivedDeadlineCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleRestore = () => {
        if (!user || !firestore) return;

        const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', deadline.id);
        updateDocumentNonBlocking(deadlineRef, {
            isCompleted: false,
            completedAt: deleteField() // remove the completedAt field
        });

        toast({
            title: 'Scadenza ripristinata!',
            description: `"${deadline.name}" è di nuovo attiva.`,
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{deadline.name}</CardTitle>
                    <CardDescription>
                        {deadline.category?.name || 'Senza categoria'}
                    </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                    {deadline.completedAt && (
                        <span>Completata il: {format(new Date(deadline.completedAt), 'd MMM yyyy', { locale: it })}</span>
                    )}
                </div>
            </CardHeader>
            <CardFooter className="pt-2 pb-4">
                 <Button variant="outline" size="sm" onClick={handleRestore} className="ml-auto">
                    <Undo className="mr-2 h-4 w-4" />
                    Ripristina
                </Button>
            </CardFooter>
        </Card>
    );
}
