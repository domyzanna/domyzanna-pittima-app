'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';


function SignupSuccessMessage() {
  const searchParams = useSearchParams();
  const fromSignup = searchParams.get('from') === 'signup';

  if (!fromSignup) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="mb-6 border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950"
    >
      <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
      <AlertTitle className="text-green-800 dark:text-green-200">
        Registrazione quasi completata!
      </AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-400">
        Controlla la tua email e clicca sul link di conferma per attivare il
        tuo account prima di accedere.
      </AlertDescription>
    </Alert>
  );
}


export default function LoginPage() {

  return (
    <>
      <div className="grid gap-2 text-center mb-4">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Pittima App
          </h1>
        </Link>
        <p className="text-balance text-muted-foreground">
          Inserisci le tue credenziali per accedere al tuo account
        </p>
      </div>
      <Suspense fallback={<div></div>}>
        <SignupSuccessMessage />
      </Suspense>
      <LoginForm />
      <div className="mt-4 text-center text-sm">
        Non hai un account?{' '}
        <Link
          href="/signup"
          className="underline text-primary hover:text-primary/80"
        >
          Registrati
        </Link>
      </div>
    </>
  );
}
