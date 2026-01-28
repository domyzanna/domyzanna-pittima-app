'use client';

import { useEffect } from 'react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupSuccessPage() {
  const auth = useAuth();

  useEffect(() => {
    // Sign the user out when they land on this page.
    // This ensures they are logged out after registration and must
    // log in again after verifying their email.
    signOut(auth);
  }, [auth]);

  return (
    <div className="grid w-full gap-6">
      <Alert
        variant="default"
        className="border-green-500 bg-green-50 dark:bg-green-950"
      >
        <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-300" />
        <AlertTitle className="text-green-800 dark:text-green-300">
          Controlla la tua email!
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Ti abbiamo inviato un link di verifica. Cliccalo per attivare il tuo
          account, poi potrai accedere.
        </AlertDescription>
      </Alert>
      <Button asChild className="w-full">
        <Link href="/login">Vai al Login</Link>
      </Button>
    </div>
  );
}
