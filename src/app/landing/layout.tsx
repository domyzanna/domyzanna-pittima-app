'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, FirebaseClientProvider } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LandingNav() {
  return (
    <div className="flex flex-1 items-center justify-end space-x-2">
      <Button asChild variant="ghost">
        <Link href="/login">Accedi</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Registrati Gratis</Link>
      </Button>
    </div>
  );
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Icons.logo className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">Pittima App</span>
              </Link>
            </div>
            <LandingNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </FirebaseClientProvider>
  );
}
