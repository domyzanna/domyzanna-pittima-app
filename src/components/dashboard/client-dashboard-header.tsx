'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { AddDeadlineDialog } from './add-deadline-dialog';
import { useState } from 'react';

export default function ClientDashboardHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-2xl font-headline font-semibold">Cruscotto</h1>
      </div>
      <div className="flex items-center gap-4">
        <AddDeadlineDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <UserNav />
      </div>
    </header>
  );
}
