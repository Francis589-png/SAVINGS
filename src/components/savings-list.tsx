"use client";

import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/currency";
import type { Saving } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { FilePlus2, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

type SavingsListProps = {
  savings: Saving[];
  isLoaded: boolean;
  deleteSaving: (id: string) => void;
};

export function SavingsList({ savings, isLoaded, deleteSaving }: SavingsListProps) {
  const [savingToDelete, setSavingToDelete] = useState<Saving | null>(null);

  const sortedSavings = [...savings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = () => {
    if (savingToDelete) {
      deleteSaving(savingToDelete.id);
      setSavingToDelete(null);
    }
  };

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
        <AlertDialog>
          <ScrollArea className="h-[250px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Value (USD)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell>
                           <Badge variant={saving.category === 'Balance Adjustment' ? 'secondary' : 'outline'} className="whitespace-nowrap">
                            {saving.category === 'Balance Adjustment' ? <FilePlus2 className="mr-1.5 h-3 w-3" /> : null}
                            {saving.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(saving.amount, saving.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            saving.usdAmount,
                            "USD"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSavingToDelete(saving)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No savings recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </ScrollArea>
          {savingToDelete && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your saving of
                  <span className="font-semibold"> {formatCurrency(savingToDelete.amount, savingToDelete.currency)}</span> from your history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSavingToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
