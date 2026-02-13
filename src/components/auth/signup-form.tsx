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
import { Eye, EyeOff } from 'lucide-react';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { doc } from 'firebase/firestore';

const passwordValidationMessage =
  'La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.';

const formSchema = z
  .object({
    displayName: z.string().min(1, 'Il nome è obbligatorio.'),
    email: z.string().email({
      message: 'Inserisci un indirizzo email valido.',
    }),
    password: z
      .string()
      .min(8, { message: passwordValidationMessage })
      .regex(/[A-Z]/, {
        message: passwordValidationMessage,
      })
      .regex(/[a-z]/, {
        message: passwordValidationMessage,
      })
      .regex(/[0-9]/, { message: passwordValidationMessage }),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        description = passwordValidationMessage;
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
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormDescription>Min. 8 caratteri, una maiuscola, una minuscola e un numero.</FormDescription>
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
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
