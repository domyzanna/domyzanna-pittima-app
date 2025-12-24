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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Category, ProcessedDeadline } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';

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

type EditDeadlineDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deadline: ProcessedDeadline;
};

export function EditDeadlineDialog({
  open,
  onOpenChange,
  deadline,
}: EditDeadlineDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: isLoadingCategories } =
    useCollection<Category>(categoriesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: deadline.name,
      description: deadline.description || '',
      categoryId: deadline.category.id,
      expirationDate: format(new Date(deadline.expirationDate), 'yyyy-MM-dd'),
      recurrence: deadline.recurrence,
      notificationDays: deadline.notificationDays || 30,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: deadline.name,
        description: deadline.description || '',
        categoryId: deadline.category.id,
        expirationDate: format(new Date(deadline.expirationDate), 'yyyy-MM-dd'),
        recurrence: deadline.recurrence,
        notificationDays: deadline.notificationDays || 30,
      });
    }
  }, [open, deadline, form]);
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !deadline) return;
    
    const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', deadline.id);
    const expirationDate = new Date(values.expirationDate);
    const notificationStartDate = subDays(expirationDate, values.notificationDays);
    
    const deadlineDataToUpdate = {
      ...values,
      expirationDate: expirationDate.toISOString(),
      notificationStartDate: notificationStartDate.toISOString(),
      notificationStatus: 'pending', 
    };

    updateDocumentNonBlocking(deadlineRef, deadlineDataToUpdate);
    toast({ title: 'Successo!', description: 'Scadenza aggiornata correttamente.' });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Aggiorna Scadenza</DialogTitle>
          <DialogDescription>Modifica i dettagli della tua scadenza.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="es. Assicurazione Auto" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={isLoadingCategories ? 'Caricamento...' : 'Seleziona una categoria'} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="expirationDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data di Scadenza</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="notificationDays" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giorni di preavviso notifica</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
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
              <Button type="submit">Salva Modifiche</Button>
            </DialogFooter>
          </form>
          </ScrollArea>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
