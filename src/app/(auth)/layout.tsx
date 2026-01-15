'use client';

import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';
import { FirebaseClientProvider } from '@/firebase';

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const authImage = placeholderImages.placeholderImages.find(
    (p) => p.id === 'auth-background'
  );

  useEffect(() => {
    // We only redirect if the user is fully loaded AND authenticated.
    // This prevents redirecting away from the login page if the user has just signed up
    // and is waiting for email verification.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // We show a spinner only while the initial user state is being determined.
  // If the user is loaded but not present (null), we proceed to render the children (login/signup forms).
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">{children}</div>
      </div>
      <div className="hidden bg-muted lg:block">
        {authImage && (
          <Image
            src={authImage.imageUrl}
            alt={authImage.description}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={authImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
        <AuthLayoutContent>{children}</AuthLayoutContent>
    </FirebaseClientProvider>
  );
}
