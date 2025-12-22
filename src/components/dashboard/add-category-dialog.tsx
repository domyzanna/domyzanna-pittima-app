
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Dispatch, SetStateAction } from 'react';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { IconSelect } from './icon-select';

const formSchema = z.object({
  name: z.string().min(1, 'Il nome della categoria è obbligatorio.'),
  icon: z.string().min(1, "L'icona è obbligatoria."),
});

type AddCategoryDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: 'Folder',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Devi essere autenticato per creare una categoria.',
      });
      return;
    }

    const categoriesColRef = collection(
      firestore,
      'users',
      user.uid,
      'categories'
    );
    const newCategoryRef = doc(categoriesColRef);
    
    setDocumentNonBlocking(newCategoryRef, { 
      ...values, 
      userId: user.uid,
      id: newCategoryRef.id 
    }, { merge: false });

    toast({
      title: 'Successo!',
      description: `Categoria "${values.name}" creata correttamente.`,
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Aggiungi Nuova Categoria</DialogTitle>
          <DialogDescription>
            Crea una nuova categoria per organizzare le tue scadenze.
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
            <DialogFooter>
              <Button type="submit">Salva Categoria</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
