
"use client";

import { useEffect } from "react";
import { useSavings } from "@/hooks/use-savings";
import { SavingsForm } from "@/components/savings-form";
import { SavingsTotal } from "@/components/savings-total";
import { SavingsList } from "@/components/savings-list";
import { SavingsChart } from "@/components/savings-chart";
import { SavingsPieChart } from "@/components/savings-pie-chart";
import { Logo } from "@/components/logo";
import { useUser, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  SidebarProvider, 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SavingsSummaryCard } from "@/components/savings-summary-card";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { savings, addSaving, totalUSD, isLoaded: savingsLoaded, deleteSaving } = useSavings();

  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const getInitials = (email?: string | null) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Can add footer items here later */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
          <header className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
              </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
                        <AvatarFallback>
                          {user.isAnonymous ? <UserIcon className="h-5 w-5" /> : getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.isAnonymous ? "Anonymous User" : user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-8">
                <SavingsTotal totalUSD={totalUSD} isLoaded={savingsLoaded} addSaving={addSaving} />
                <SavingsForm addSaving={addSaving} disabled={!savingsLoaded || !user} />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-8">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <SavingsPieChart savings={savings} isLoaded={savingsLoaded} />
                  <SavingsSummaryCard savings={savings} isLoaded={savingsLoaded} />
                </div>
                <SavingsChart savings={savings} isLoaded={savingsLoaded} />
                <SavingsList savings={savings} isLoaded={savingsLoaded} deleteSaving={deleteSaving} />
              </div>
            </div>
          </main>

          <footer className="text-center p-4 text-sm text-muted-foreground border-t mt-8">
            <p>Built for financial freedom. &copy; {new Date().getFullYear()} CurrencyTrack.</p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
