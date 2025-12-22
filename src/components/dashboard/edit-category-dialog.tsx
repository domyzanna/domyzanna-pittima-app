
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  useFirestore,
  useUser,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { IconSelect } from './icon-select';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome della categoria è obbligatorio.'),
  icon: z.string().min(1, "L'icona è obbligatoria."),
});

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  category: Category;
};

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditCategoryDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [deadlineCount, setDeadlineCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: category.name,
      icon: category.icon,
    },
  });

  useEffect(() => {
    async function checkDeadlines() {
      if (!user || !firestore) return;
      setIsChecking(true);
      const deadlinesQuery = query(
        collection(firestore, 'users', user.uid, 'deadlines'),
        where('categoryId', '==', category.id)
      );
      const snapshot = await getDocs(deadlinesQuery);
      setDeadlineCount(snapshot.size);
      setIsChecking(false);
    }
    if (open) {
      checkDeadlines();
    }
  }, [open, user, firestore, category.id]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;

    const categoryRef = doc(firestore, 'users', user.uid, 'categories', category.id);
    updateDocumentNonBlocking(categoryRef, values);
    toast({
      title: 'Successo!',
      description: 'Categoria aggiornata correttamente.',
    });
    onOpenChange(false);
  }

  const handleDelete = () => {
    if (!user || !firestore || (deadlineCount !== null && deadlineCount > 0) ) return;

    const categoryRef = doc(firestore, 'users', user.uid, 'categories', category.id);
    deleteDocumentNonBlocking(categoryRef);
    toast({
      title: 'Eliminata!',
      description: `La categoria "${category.name}" è stata eliminata.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Modifica Categoria</DialogTitle>
          <DialogDescription>
            Aggiorna il nome e l'icona di questa categoria.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Salute" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icona</FormLabel>
                   <IconSelect
                    selectedValue={field.value}
                    onValueChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-between items-center sm:justify-between sm:w-full">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={isChecking || (deadlineCount !== null && deadlineCount > 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione è irreversibile e la categoria verrà eliminata permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Sì, elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit">Salva Modifiche</Button>
            </DialogFooter>
          </form>
        </Form>
        {isChecking && <p className="text-sm text-muted-foreground">Controllo scadenze collegate...</p>}
        {!isChecking && deadlineCount !== null && deadlineCount > 0 && (
            <Alert variant="destructive">
                <AlertTitle>Impossibile eliminare</AlertTitle>
                <AlertDescription>
                    Ci sono {deadlineCount} scadenze collegate a questa categoria. Per poterla eliminare, sposta o cancella prima le scadenze associate.
                </AlertDescription>
            </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
