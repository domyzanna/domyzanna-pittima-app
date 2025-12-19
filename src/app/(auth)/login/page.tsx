'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
        <p className="text-balance text-muted-foreground">
          Inserisci le tue credenziali per accedere al tuo account
        </p>
      </div>
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
