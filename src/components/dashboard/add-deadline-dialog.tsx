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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Category, Deadline } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { UpgradeProDialog } from './upgrade-pro-dialog';

const FREE_PLAN_LIMIT = 6;
// Lista VIP per i beta tester. Sostituisci con le loro email reali.
const PRO_USERS: string[] = [];

const formSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'La categoria è obbligatoria'),
  expirationDate: z.string().min(1, 'La data di scadenza è obbligatoria.'),
  recurrence: z.enum([
    'una-tantum',
    'mensile',
    'trimestrale',
    'semestrale',
    'annuale',
  ]),
  notificationDays: z.coerce.number().min(0, 'I giorni di preavviso devono essere un numero positivo'),
});

export function AddDeadlineDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const deadlinesQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'users', user.uid, 'deadlines'), where('isCompleted', '==', false)) : null,
    [user, firestore]
  );
  const { data: activeDeadlines, isLoading: isLoadingDeadlines } = useCollection<Deadline>(deadlinesQuery);

  // Fetch user's Stripe subscriptions to determine Pro status
  const subscriptionsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'customers', user.uid, 'subscriptions'), where('status', 'in', ['trialing', 'active'])) : null,
    [user, firestore]
  );
  const { data: subscriptions } = useCollection(subscriptionsQuery);

  const isProUser = (subscriptions && subscriptions.length > 0) || (user?.email ? PRO_USERS.includes(user.email) : false);
  const isLimitReached = !isProUser && (activeDeadlines?.length ?? 0) >= FREE_PLAN_LIMIT;


  const handleOpenChange = (open: boolean) => {
    if (open && isLimitReached) {
      // If the user tries to open the dialog and has reached the limit,
      // we keep the main dialog closed and open the upgrade dialog instead.
      setIsOpen(false); 
      // This requires a way to trigger the upgrade dialog.
      // We'll manage this by having a separate state for the upgrade dialog.
      document.dispatchEvent(new CustomEvent('open-upgrade-dialog'));

    } else {
      setIsOpen(open);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Scadenza
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">
              Aggiungi Nuova Scadenza
            </DialogTitle>
            <DialogDescription>
              Compila i dettagli per la tua nuova scadenza.
            </DialogDescription>
          </DialogHeader>
          <AddDeadlineForm onFinished={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
      <UpgradeProDialog limit={FREE_PLAN_LIMIT} />
    </>
  );
}


// We extract the form into its own component to reuse hooks
function AddDeadlineForm({ onFinished }: { onFinished: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  }, [categories]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: undefined,
      expirationDate: '',
      recurrence: 'una-tantum',
      notificationDays: 30,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Devi essere autenticato per aggiungere una scadenza.',
      });
      return;
    }

    const expirationDate = new Date(values.expirationDate);
    const notificationStartDate = subDays(expirationDate, values.notificationDays);

    const deadlineData = {
      ...values,
      userId: user.uid,
      isCompleted: false,
      expirationDate: expirationDate.toISOString(),
      notificationStartDate: notificationStartDate.toISOString(),
      notificationStatus: 'active', // Default to active notifications
    };
    const deadlinesColRef = collection(firestore, 'users', user.uid, 'deadlines');
    addDocumentNonBlocking(deadlinesColRef, deadlineData);
    toast({
      title: 'Successo!',
      description: 'Nuova scadenza aggiunta correttamente.',
      duration: 5000,
    });
    onFinished();
    form.reset();
  }

  return (
    <Form {...form}>
      <ScrollArea className="max-h-[calc(100vh-12rem)]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="es. Assicurazione Auto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? 'Caricamento...' : 'Seleziona una categoria'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sortedCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Scadenza</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notificationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giorni di preavviso notifica</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione (Opzionale)</FormLabel>
                  <FormControl><Textarea placeholder="Aggiungi dettagli o note..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="recurrence" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ricorrenza</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleziona la frequenza" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="una-tantum">Una tantum</SelectItem>
                      <SelectItem value="mensile">Mensile</SelectItem>
                      <SelectItem value="trimestrale">Trimestrale</SelectItem>
                      <SelectItem value="semestrale">Semestrale</SelectItem>
                      <SelectItem value="annuale">Annuale</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          <DialogFooter className="pt-4">
            <Button type="submit">Salva Scadenza</Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </Form>
  )
}