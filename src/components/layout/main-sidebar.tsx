'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSkeleton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import * as LucideIcons from 'lucide-react';
import { LayoutDashboard, PlusCircle, Settings, HelpCircle, Download, CreditCard, Bell, History } from 'lucide-react';
import { Icons } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import {
  useAuth,
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Category, Deadline, Recurrence } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { AddCategoryDialog } from '../dashboard/add-category-dialog';
import { iconNames } from '@/lib/icons';
import { EditCategoryDialog } from '../dashboard/edit-category-dialog';
import { HowItWorksDialog } from '../dashboard/how-it-works-dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { createStripePortalSession } from '@/app/actions';
import { PushNotificationToggle } from '@/components/dashboard/push-notification-toggle';

const getIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent && iconNames.includes(iconName)) {
    return <IconComponent />;
  }
  const FallbackIcon = (LucideIcons as any)['Folder'];
  return <FallbackIcon />;
};
  

export function MainSidebar({ isProUser }: { isProUser: boolean }) {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: isLoadingCategories } =
    useCollection<Category>(categoriesQuery);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));
  }, [categories]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/landing');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const handleExportCSV = async () => {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Errore',
            description: 'Utente non autenticato o database non disponibile.',
        });
        return;
    }

    toast({
        title: 'Esportazione in corso...',
        description: 'Stiamo preparando il tuo file CSV.',
    });

    try {
        const categoriesRef = collection(firestore, 'users', user.uid, 'categories');
        const deadlinesRef = collection(firestore, 'users', user.uid, 'deadlines');

        const [categoriesSnapshot, deadlinesSnapshot] = await Promise.all([
            getDocs(categoriesRef),
            getDocs(deadlinesRef),
        ]);

        const categoriesData = new Map<string, string>();
        categoriesSnapshot.forEach(doc => {
            const cat = doc.data() as Category;
            categoriesData.set(doc.id, cat.name);
        });

        const deadlinesData = deadlinesSnapshot.docs.map(doc => doc.data() as Deadline);

        if (deadlinesData.length === 0) {
            toast({
                variant: 'default',
                title: 'Nessuna scadenza',
                description: 'Non ci sono scadenze da esportare.',
            });
            return;
        }

        const dataToExport = deadlinesData.map(d => {
             const recurrenceMap: Record<Recurrence, string> = {
                'una-tantum': 'Una Tantum',
                'mensile': 'Mensile',
                'bimestrale': 'Bimestrale',
                'trimestrale': 'Trimestrale',
                'quadrimestrale': 'Quadrimestrale',
                'semestrale': 'Semestrale',
                'annuale': 'Annuale',
            };

            return {
                'Nome Scadenza': d.name,
                'Categoria': categoriesData.get(d.categoryId) || 'Sconosciuta',
                'Data Scadenza': new Date(d.expirationDate).toLocaleDateString('it-IT'),
                'Ricorrenza': recurrenceMap[d.recurrence] || d.recurrence,
                'Descrizione': d.description || '',
                'Completato': d.isCompleted ? 'Sì' : 'No',
            };
        });

        const headers = Object.keys(dataToExport[0]);
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row =>
                headers
                    .map(fieldName => {
                        const value = (row as any)[fieldName]
                        const escaped = String(value).replace(/"/g, '""');
                        return `"${escaped}"`;
                    })
                    .join(',')
            ),
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pittima_scadenze.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: 'Esportazione completata!',
            description: 'Il tuo file CSV è stato scaricato.',
        });

    } catch (error) {
        console.error("Errore durante l'esportazione CSV:", error);
        toast({
            variant: 'destructive',
            title: 'Esportazione fallita',
            description: 'Si è verificato un errore durante la preparazione del file.',
        });
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Non autenticato',
        description: 'Devi essere loggato per gestire il tuo abbonamento.',
      });
      return;
    }

    try {
      const { url } = await createStripePortalSession(user.uid);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating Stripe portal session:', error);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description:
          error.message ||
          'Impossibile accedere al portale di gestione. Riprova più tardi.',
      });
    }
  };


  return (
    <>
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Icons.logo className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Pittima App
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                isActive={pathname === '/dashboard'}
                className="bg-primary text-primary-foreground hover:bg-primary/90 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                >
                <Link href="/dashboard">
                    <LayoutDashboard />
                    Dashboard
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarSeparator />

            {isLoadingCategories && (
                <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                </>
            )}

            {sortedCategories.map((cat) => (
                <SidebarMenuItem key={cat.id}>
                <SidebarMenuButton
                    asChild
                    tooltip={cat.name}
                    isActive={pathname === `/dashboard/category/${cat.id}`}
                >
                    <Link href={`/dashboard/category/${cat.id}`}>
                    {getIcon(cat.icon)}
                    {cat.name}
                    </Link>
                </SidebarMenuButton>
                    <SidebarMenuAction
                        aria-label="Modifica categoria"
                        showOnHover
                        onClick={() => setEditingCategory(cat)}
                    >
                        <Settings />
                    </SidebarMenuAction>
                </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip="Aggiungi Categoria"
                    onClick={() => setIsAddCategoryDialogOpen(true)}
                    className="text-primary font-semibold"
                >
                    <PlusCircle />
                    Aggiungi Categoria
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarSeparator />

            <SidebarMenuItem>
                <SidebarMenuButton
                    tooltip="Come funziona"
                    onClick={() => setIsHowItWorksOpen(true)}
                    className="text-green-600 font-semibold"
                >
                    <HelpCircle />
                    Come funziona
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start items-center gap-3"
            >
              <div className="group-data-[collapsible=icon]:-ml-1">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={
                      user?.photoURL ??
                      `https://avatar.vercel.sh/${user?.email}.png`
                    }
                    alt={user?.email ?? '@utente'}
                  />
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">
                  {user?.displayName || 'Utente'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'Utente'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              {user && <PushNotificationToggle userId={user.uid} />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              <span>Esporta CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/archive">
                <History className="mr-2 h-4 w-4" />
                <span>Archivio</span>
              </Link>
            </DropdownMenuItem>
            {isProUser && (
              <DropdownMenuItem onClick={handleManageSubscription}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Gestisci Abbonamento</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Esci</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
    <AddCategoryDialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen} />
    {editingCategory && (
        <EditCategoryDialog
            open={!!editingCategory}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setEditingCategory(null);
                }
            }}
            category={editingCategory}
        />
    )}
    <HowItWorksDialog open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
    </>
  );
}
