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
import { useEffect } from 'react';
import {
  useFirestore,
  useUser,
  updateDocumentNonBlocking
} from '@/firebase';
import {
  doc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { IconSelect } from './icon-select';


const formSchema = z.object({
  name: z.string().min(1, 'Il nome della categoria è obbligatorio.'),
  icon: z.string().min(1, "L'icona è obbligatoria."),
});

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || 'Folder',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
      });
    }
  }, [category, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !category) return;

    const categoryRef = doc(firestore, 'users', user.uid, 'categories', category.id);
    updateDocumentNonBlocking(categoryRef, values);
    toast({
      title: 'Successo!',
      description: 'Categoria aggiornata correttamente.',
      duration: 5000,
    });
    onOpenChange(false);
  }
  
  if (!category) {
    return null;
  }

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
            <DialogFooter className="pt-4">
              <Button type="submit">Salva Modifiche</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
