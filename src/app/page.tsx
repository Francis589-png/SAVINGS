"use client";

import { useSavings } from "@/hooks/use-savings";
import { SavingsForm } from "@/components/savings-form";
import { SavingsTotal } from "@/components/savings-total";
import { SavingsList } from "@/components/savings-list";
import { SavingsChart } from "@/components/savings-chart";
import { Logo } from "@/components/logo";

export default function Home() {
  const { savings, addSaving, totalUSD, isLoaded, deleteSaving } = useSavings();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto">
          <Logo />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <SavingsTotal totalUSD={totalUSD} isLoaded={isLoaded} />
            <SavingsForm addSaving={addSaving} disabled={!isLoaded} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <SavingsChart savings={savings} isLoaded={isLoaded} />
            <SavingsList savings={savings} isLoaded={isLoaded} deleteSaving={deleteSaving} />
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-muted-foreground border-t mt-8">
        <p>Built for financial freedom. &copy; {new Date().getFullYear()} CurrencyTrack.</p>
      </footer>
    </div>
  );
}
