'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import {
  useUser,
  FirebaseClientProvider,
  useCollection,
  useFirestore,
  useMemoFirebase,
  useDoc,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { collection, doc } from 'firebase/firestore';
import type { Deadline, User as AppUser } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { UpgradeProDialog } from '@/components/dashboard/upgrade-pro-dialog';

const FREE_PLAN_LIMIT = 6;
const TRIAL_PERIOD_DAYS = 90;

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

  // Fetch user profile data to get creationTime
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: appUser, isLoading: isUserDataLoading } =
    useDoc<AppUser>(userDocRef);


  // Fetch active deadlines to check count
  const deadlinesQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'deadlines') : null,
    [user, firestore]
  );
  const { data: deadlines, isLoading: areDeadlinesLoading } = useCollection<Deadline>(deadlinesQuery, {
    constraints: [{ type: 'where', fieldPath: 'isCompleted', opStr: '==', value: false }]
  });

  const isLoading = isUserLoading || isUserDataLoading || areDeadlinesLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const trialExpired = useMemo(() => {
    if (!appUser?.creationTime) return false;
    return differenceInDays(new Date(), new Date(appUser.creationTime)) > TRIAL_PERIOD_DAYS;
  }, [appUser]);

  const limitExceeded = (deadlines?.length ?? 0) > FREE_PLAN_LIMIT;
  const isProUser = user?.email ? PRO_USERS.includes(user.email) : false;
  const shouldBlock = trialExpired && limitExceeded && !isProUser;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (shouldBlock) {
    return <UpgradeProDialog limit={FREE_PLAN_LIMIT} forceOpen={true} />;
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        {children}
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
  )
}
