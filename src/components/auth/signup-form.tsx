'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

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

const formSchema = z
  .object({
    email: z.string().email({
      message: 'Inserisci un indirizzo email valido.',
    }),
    password: z
      .string()
      .min(6, 'La password deve contenere almeno 6 caratteri.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non coincidono.',
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await sendEmailVerification(userCredential.user);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error creating user', error);
      let description = "Impossibile creare l'account. Riprova più tardi.";
      if (error.code === 'auth/email-already-in-use') {
        description = 'Questo indirizzo email è già in uso. Prova ad accedere.';
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
          <AlertTitle className="text-green-800">Registrazione completata!</AlertTitle>
          <AlertDescription className="text-green-700">
            Ti abbiamo inviato un'email. Clicca sul link di conferma per
            attivare il tuo account e poter accedere.
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conferma Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Crea Account
        </Button>
      </form>
    </Form>
  );
}
