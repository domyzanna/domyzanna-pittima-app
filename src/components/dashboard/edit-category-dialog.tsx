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
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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
import { Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';


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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      icon: category.icon,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category.name,
        icon: category.icon,
      });
    }
  }, [open, category, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !category) return;

    const categoryRef = doc(firestore, 'users', user.uid, 'categories', category.id);
    updateDocumentNonBlocking(categoryRef, values);
    toast({
      title: 'Successo!',
      description: 'Categoria aggiornata correttamente.',
    });
    onOpenChange(false);
  }
  
  const handleDelete = () => {
    if (!user || !firestore || !category) return;

    const categoryRef = doc(firestore, 'users', user.uid, 'categories', category.id);
    // Note: This doesn't delete the deadlines within the category.
    // That would require a more complex batch operation or a cloud function.
    updateDocumentNonBlocking(categoryRef, {isDeleted: true}); // Soft delete for now
    toast({
      variant: 'destructive',
      title: 'Categoria Eliminata',
      description: `La categoria "${category.name}" è stata eliminata.`,
    });
    
    setIsDeleteConfirmOpen(false);
    onOpenChange(false);
  }


  return (
    <>
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
            <DialogFooter className="pt-4 justify-between">
               <Button type="button" variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
              </Button>
              <Button type="submit">Salva Modifiche</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
     {category && (
        <DeleteConfirmationDialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            itemName={category.name}
            onConfirm={handleDelete}
        />
    )}
    </>
  );
}

