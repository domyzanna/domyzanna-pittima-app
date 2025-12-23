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
import { LayoutDashboard, PlusCircle, Settings, Shield } from 'lucide-react';
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Category } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useState } from 'react';
import { AddCategoryDialog } from '../dashboard/add-category-dialog';
import { iconNames } from '@/lib/icons';
import { EditCategoryDialog } from '../dashboard/edit-category-dialog';

const getIcon = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent && iconNames.includes(iconName)) {
    return <IconComponent />;
  }
  const FallbackIcon = (LucideIcons as any)['Folder'];
  return <FallbackIcon />;
};

export function MainSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);


  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'categories') : null),
    [firestore, user]
  );
  const { data: categories, isLoading: isLoadingCategories } =
    useCollection<Category>(categoriesQuery);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
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
      <SidebarContent className="p-2 overflow-y-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Dashboard"
              isActive={pathname === '/dashboard'}
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

          {categories?.map((cat) => (
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
              >
                <PlusCircle />
                Aggiungi Categoria
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarSeparator />
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                tooltip="Admin"
                isActive={pathname === '/dashboard/admin'}
                >
                <Link href="/dashboard/admin">
                    <Shield />
                    Admin
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
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
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Profilo</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/dashboard/settings">Impostazioni</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
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
    </>
  );
}
