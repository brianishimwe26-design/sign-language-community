import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Aurora } from "@/components/aurora";

export const Route = createFileRoute("/_shell")({ component: Shell });

function Shell() {
  return (
    <SidebarProvider>
      <div className="relative isolate flex min-h-screen w-full">
        <Aurora />
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b border-border/50 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Sign language AI companion</span>
          </header>
          <main className="relative flex-1"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
