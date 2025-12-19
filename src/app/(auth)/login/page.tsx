import { LoginForm } from '@/components/auth/login-form';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      <div className="grid gap-2 text-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Dinamico Scadenze
          </h1>
        </Link>
        <p className="text-balance text-muted-foreground">
          Inserisci le tue credenziali per accedere alle tue scadenze
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
