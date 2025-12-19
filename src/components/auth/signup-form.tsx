'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';

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

const formSchema = z.object({
  email: z.string().email({
    message: 'Inserisci un indirizzo email valido.',
  }),
});

const actionCodeSettings = {
  url: typeof window !== 'undefined' ? `${window.location.origin}/login` : '',
  handleCodeInApp: true,
};

export function SignupForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', values.email);
      setIsEmailSent(true);
      toast({
        title: 'Controlla la tua email!',
        description: `Abbiamo inviato un link di accesso a ${values.email}.`,
      });
    } catch (error: any) {
      console.error('Error sending sign in link', error);
      toast({
        variant: 'destructive',
        title: 'Qualcosa è andato storto',
        description:
          "Impossibile inviare il link di accesso. Riprova più tardi.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <div className="text-center text-muted-foreground p-8 border bg-muted/50 rounded-lg">
        <p>
          Abbiamo inviato un link di accesso sicuro al tuo indirizzo email.
          Clicca sul link per completare l'accesso.
        </p>
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
          Registrati con Email
        </Button>
      </form>
    </Form>
  );
}
