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
import { collection, query, where } from 'firebase/firestore';
import type { Deadline } from '@/lib/types';
import { UpgradeProDialog } from '@/components/dashboard/upgrade-pro-dialog';

const PRO_USERS = [
    'domyzmail@gmail.com',
    'domyz71@alice.it',
    'sheila99@virgilio.it',
    'samanthagiampapa495@gmail.com',
];
const FREE_PLAN_LIMIT = 6;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Fetch active deadlines to check count
  const deadlinesQuery = useMemoFirebase(
    () =>
      user ? query(collection(firestore, 'users', user.uid, 'deadlines'), where('isCompleted', '==', false)) : null,
    [user, firestore]
  );
  const { data: deadlines, isLoading: areDeadlinesLoading } =
    useCollection<Deadline>(deadlinesQuery);
    
  // Fetch user's Stripe subscriptions to determine Pro status
  const subscriptionsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'customers', user.uid, 'subscriptions'), where('status', 'in', ['trialing', 'active'])) : null,
    [user, firestore]
  );
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useCollection(subscriptionsQuery);

  const isLoading = isUserLoading || areDeadlinesLoading || isLoadingSubscriptions;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // A user is "Pro" if they have at least one active subscription.
  const isProUser = (subscriptions && subscriptions.length > 0) || (user?.email && PRO_USERS.includes(user.email));
  
  const limitExceeded = (deadlines?.length ?? 0) >= FREE_PLAN_LIMIT;
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
        {shouldBlock ? (
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
