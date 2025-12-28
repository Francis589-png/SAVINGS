import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-10 w-10">
        <Image 
          src="/logo.png" 
          alt="CurrencyTrack Logo" 
          fill
          sizes="40px"
          className="object-contain"
        />
      </div>
      <span className="text-2xl font-bold font-headline text-primary">CurrencyTrack</span>
    </div>
  );
}
