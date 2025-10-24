"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, SLL_TO_USD_RATE } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

type SavingsTotalProps = {
  totalUSD: number;
  isLoaded: boolean;
};

export function SavingsTotal({ totalUSD, isLoaded }: SavingsTotalProps) {
  const totalSLL = totalUSD * SLL_TO_USD_RATE;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Total Savings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">in United States Dollar</p>
          {isLoaded ? (
            <p className="text-4xl font-bold text-primary transition-colors duration-300">{formatCurrency(totalUSD, 'USD')}</p>
          ) : (
            <Skeleton className="h-10 w-48 mt-1" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">in Sierra Leonean Leone</p>
           {isLoaded ? (
            <p className="text-2xl font-semibold text-foreground/80 transition-colors duration-300">{formatCurrency(totalSLL, 'SLL')}</p>
          ) : (
            <Skeleton className="h-8 w-40 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
