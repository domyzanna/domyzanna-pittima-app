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
  User as UserIcon,
} from 'lucide-react';
import { Icons } from '../icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
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

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
              <DropdownMenuItem>Profilo</DropdownMenuItem>
              <DropdownMenuItem>Impostazioni</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Esci</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Account" className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Account
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" align="end">
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
                    <DropdownMenuItem>Profilo</DropdownMenuItem>
                    <DropdownMenuItem>Impostazioni</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Esci</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}