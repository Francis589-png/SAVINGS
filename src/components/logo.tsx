import { PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow">
        <PiggyBank className="h-6 w-6" />
      </div>
      <span className="text-2xl font-bold font-headline text-primary">CurrencyTrack</span>
    </div>
  );
}
