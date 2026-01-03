'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AddDeadlineDialog } from './add-deadline-dialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

type ClientDashboardHeaderProps = {
  totalDeadlines: number;
};

export default function ClientDashboardHeader({
  totalDeadlines,
}: ClientDashboardHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 mb-4 md:mb-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-2xl font-headline font-semibold">Dashboard</h1>
        <Badge variant="secondary" className="text-base">
          {totalDeadlines}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <AddDeadlineDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </header>
  );
}
