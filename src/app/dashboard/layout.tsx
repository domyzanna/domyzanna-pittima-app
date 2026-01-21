'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import {
  useUser,
  FirebaseClientProvider,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { collection } from 'firebase/firestore';
import type { Deadline } from '@/lib/types';
import { UpgradeProDialog } from '@/components/dashboard/upgrade-pro-dialog';
import { VerifyEmailBanner } from '@/components/auth/verify-email-banner';

const FREE_PLAN_LIMIT = 6;

// Lista VIP per i beta tester.
const PRO_USERS = [
  'domyzmail@gmail.com',
  'sheila99@virgilio.it',
  'samanthagiampapa495@gmail.com',
  'tester1@example.com',
  'tester2@example.com',
  'tester3@example.com',
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Fetch active deadlines to check count
  const deadlinesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'deadlines') : null,
    [user, firestore]
  );
  const { data: deadlines, isLoading: areDeadlinesLoading } =
    useCollection<Deadline>(deadlinesQuery, {
      constraints: [{ type: 'where', fieldPath: 'isCompleted', opStr: '==', value: false }],
    });

  const isLoading = isUserLoading || areDeadlinesLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const limitExceeded = (deadlines?.length ?? 0) >= FREE_PLAN_LIMIT;
  const isProUser = user?.email ? PRO_USERS.includes(user.email) : false;
  const shouldBlock = limitExceeded && !isProUser;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        {!user.emailVerified ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <VerifyEmailBanner user={user} />
          </div>
        ) : shouldBlock ? (
          <UpgradeProDialog limit={FREE_PLAN_LIMIT} forceOpen={true} />
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </FirebaseClientProvider>
  );
}
