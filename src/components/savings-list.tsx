"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, convertToUSD } from "@/lib/currency";
import type { Saving } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

type SavingsListProps = {
  savings: Saving[];
  isLoaded: boolean;
};

export function SavingsList({ savings, isLoaded }: SavingsListProps) {
  const sortedSavings = [...savings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Savings History</CardTitle>
        <CardDescription>A list of your recent savings.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Value (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoaded ? renderSkeleton() :
                sortedSavings.length > 0 ? (
                  sortedSavings.map((saving) => (
                    <TableRow key={saving.id}>
                      <TableCell>
                        {new Date(saving.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(saving.amount, saving.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          convertToUSD(saving.amount, saving.currency),
                          "USD"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      No savings recorded yet.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
