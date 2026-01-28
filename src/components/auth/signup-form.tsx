'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { doc } from 'firebase/firestore';

const formSchema = z
  .object({
    displayName: z.string().min(1, 'Il nome è obbligatorio.'),
    email: z.string().email({
      message: 'Inserisci un indirizzo email valido.',
    }),
    password: z
      .string()
      .min(8, { message: 'La password deve contenere almeno 8 caratteri.' })
      .regex(/[A-Z]/, {
        message: 'La password deve contenere almeno una lettera maiuscola.',
      })
      .regex(/[a-z]/, {
        message: 'La password deve contenere almeno una lettera minuscola.',
      })
      .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero.' }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non coincidono.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.acceptTerms, {
    message: 'Devi accettare i termini e la privacy policy.',
    path: ['acceptTerms'],
  });

export function SignupForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
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

      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: values.displayName });

      // Create user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(
        userDocRef,
        {
          id: user.uid,
          displayName: values.displayName,
          email: user.email,
        },
        { merge: false }
      );

      await sendEmailVerification(user);

      // Redirect to a dedicated success page which will handle sign out
      router.push('/signup/success');
    } catch (error: any) {
      let description = "Impossibile creare l'account. Riprova più tardi.";
      if (error.code === 'auth/email-already-in-use') {
        description = 'Questo indirizzo email è già in uso. Prova ad accedere.';
      } else if (error.code === 'auth/weak-password') {
        description =
          'La password non rispetta i requisiti di sicurezza. Deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.';
      }
      toast({
        variant: 'destructive',
        title: 'Qualcosa è andato storto',
        description,
      });
      setIsLoading(false); // Set loading to false only on error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Mario Rossi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Accetta termini e condizioni</FormLabel>
                <FormDescription>
                  Dichiari di aver letto e accettato i{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="underline text-primary"
                  >
                    Termini di Servizio
                  </Link>{' '}
                  e la{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Registrati
        </Button>
      </form>
    </Form>
  );
}
