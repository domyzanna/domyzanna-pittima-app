'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({
    message: 'Inserisci un indirizzo email valido.',
  }),
});

export function ForgotPasswordForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error sending password reset email', error);
      let description = "Impossibile inviare l'email. Riprova più tardi.";
      if (error.code === 'auth/user-not-found') {
        description =
          'Nessun utente trovato con questa email. Controlla e riprova.';
      }
      toast({
        variant: 'destructive',
        title: 'Qualcosa è andato storto',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <Alert variant="default" className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-700" />
          <AlertTitle className="text-green-800">Email inviata!</AlertTitle>
          <AlertDescription className="text-green-700">
            Controlla la tua casella di posta. Ti abbiamo inviato un link per resettare la tua password.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
            <Link href="/login">Torna al Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nome@esempio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Invia Email di Recupero
        </Button>
      </form>
    </Form>
  );
}
