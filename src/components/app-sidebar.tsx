import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Hand, HandHeart, Settings, MessageCircle, User, LogOut } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account-provider';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const items = [
  { title: "Chat", url: "/", icon: MessageCircle },
  { title: "Hand Letters", url: "/letters", icon: Hand },
  { title: "Names", url: "/names", icon: HandHeart },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const account = useAccount();
  const queryClient = useQueryClient();
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) return;
    await navigate({ to: '/login', replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Hand className="h-4 w-4" />
          </div>
          {!collapsed && <span className="font-display text-xl font-extrabold text-gradient">Signa</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title} className="h-10 rounded-xl data-[active=true]:bg-gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-soft">
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-xl p-1.5 text-left" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                {account.avatarUrl && <AvatarImage src={account.avatarUrl} alt={account.name} />}
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">{account.initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                   <p className="truncate text-sm font-semibold">{account.loading ? 'Loading…' : account.name}</p>
                   <p className="truncate text-xs text-muted-foreground">{account.user?.email ?? 'Not signed in'}</p>
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-48 rounded-2xl p-1.5 glass">
            <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <User className="h-4 w-4" /> Profile
            </Link>
            <Button variant="ghost" onClick={() => account.user ? void signOut() : void navigate({ to: '/login' })} className="w-full justify-start rounded-lg px-3 text-destructive">
              <LogOut className="h-4 w-4" /> {account.user ? 'Log Out' : 'Log in'}
            </Button>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}
