'use client';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
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
        <h2 className="text-2xl font-bold">Recupera Password</h2>
        <p className="text-balance text-muted-foreground">
          Inserisci la tua email e ti invieremo un link per resettare la password.
        </p>
      </div>
      <ForgotPasswordForm />
      <div className="mt-4 text-center text-sm">
        Ricordi la password?{' '}
        <Link
          href="/login"
          className="underline text-primary hover:text-primary/80"
        >
          Accedi
        </Link>
      </div>
    </>
  );
}
