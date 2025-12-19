'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Car,
  Shield,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { Icons } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Cruscotto' },
  { href: '/dashboard/vehicles', icon: Car, label: 'Veicoli' },
  { href: '/dashboard/insurance', icon: Shield, label: 'Assicurazioni' },
  { href: '/dashboard/documents', icon: FileText, label: 'Documenti' },
  { href: '/dashboard/custom', icon: PlusCircle, label: 'Personalizzato' },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

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
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Icons.logo className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Pittima App
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={
                  item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
              >
                <Link href="#">
                  <item.icon />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.photoURL ?? `https://avatar.vercel.sh/${user?.email}.png`}
              alt={user?.email ?? '@utente'}
            />
            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">
              {user?.displayName || 'Utente'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto group-data-[collapsible=icon]:hidden"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
