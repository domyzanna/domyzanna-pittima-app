'use client';
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<
    'loading' | 'error' | 'success' | 'idle'
  >('loading');

  useEffect(() => {
    if (!auth || isUserLoading) {
      return; // Wait for auth and user state to be ready
    }

    if (user) {
      // If user is already signed in, redirect to dashboard.
      router.push('/dashboard');
      return;
    }

    // This is the core logic for handling the email link sign-in.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // This can happen if the user opens the link on a different device.
        email = window.prompt(
          'Per favore, fornisci la tua email per completare l\'accesso:'
        );
      }

      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            setStatus('success');
            router.push('/dashboard');
          })
          .catch((error) => {
            console.error('Sign in with email link error', error);
            setStatus('error');
            toast({
              variant: 'destructive',
              title: 'Accesso fallito',
              description: `Il link potrebbe essere scaduto o non valido. Riprova a registrarti.`,
            });
          });
      } else {
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'Email mancante',
          description:
            'Impossibile completare l\'accesso senza l\'indirizzo email.',
        });
      }
    } else {
      // If the URL is not a sign-in link and the user is not logged in,
      // it means they have landed here to sign up.
      setStatus('idle');
    }
  }, [auth, router, user, isUserLoading, toast]);

  return (
    <>
      <div className="grid gap-2 text-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Pittima App
          </h1>
        </Link>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
          <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifica in corso...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">
          <p>Impossibile completare l'accesso. Il link potrebbe non essere valido o scaduto.</p>
          <p className="mt-4">
            <Link href="/signup" className="underline font-bold">
              Torna alla registrazione
            </Link>
          </p>
        </div>
      )}
      
      {status === 'idle' && (
         <div className="mt-4 text-center text-sm">
         <p className='text-balance text-muted-foreground'>Per accedere, registrati prima con la tua email. Ti invieremo un link di accesso sicuro.</p>
         <Link
           href="/signup"
           className="underline text-primary hover:text-primary/80"
         >
           Vai alla registrazione
         </Link>
       </div>
      )}
    </>
  );
}
