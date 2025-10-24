"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, convertFromUSD, SLL_TO_USD_RATE } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Pencil, Save, X } from "lucide-react";
import { z } from "zod";

type SavingsTotalProps = {
  totalUSD: number;
  isLoaded: boolean;
  addSaving: (data: { amount: number; currency: 'USD' | 'SLL', category?: string }) => void;
};

const amountSchema = z.coerce.number().min(0, "Total must be a positive number.");

export function SavingsTotal({ totalUSD, isLoaded, addSaving }: SavingsTotalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTotal, setEditedTotal] = useState<string>(totalUSD.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  const totalSLL = convertFromUSD(totalUSD, 'SLL');
  const editedTotalSLL = convertFromUSD(parseFloat(editedTotal) || 0, 'SLL');

  const handleEditClick = () => {
    setEditedTotal(totalUSD.toFixed(2));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = () => {
    const validation = amountSchema.safeParse(editedTotal);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    
    const newTotalUSD = validation.data;
    const difference = newTotalUSD - totalUSD;

    if (Math.abs(difference) > 0.001) { // Check for a meaningful change
      addSaving({
        amount: difference,
        currency: 'USD',
        category: 'Balance Adjustment',
      });
    }
    
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline">Total Savings</CardTitle>
        {!isEditing && isLoaded && (
            <Button variant="ghost" size="icon" onClick={handleEditClick} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
            </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">in United States Dollar</p>
          {isLoaded ? (
            isEditing ? (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                   <Input
                      type="number"
                      value={editedTotal}
                      onChange={(e) => {
                        setEditedTotal(e.target.value);
                        setError(null);
                      }}
                      className="text-4xl font-bold text-primary h-auto p-0 border-0 shadow-none focus-visible:ring-0"
                      step="0.01"
                    />
                    <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 shrink-0">
                        <Save className="h-5 w-5 text-green-600" />
                    </Button>
                     <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 shrink-0">
                        <X className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
                 {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>
            ) : (
              <p className="text-4xl font-bold text-primary transition-colors duration-300">{formatCurrency(totalUSD, 'USD')}</p>
            )
          ) : (
            <Skeleton className="h-10 w-48 mt-1" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">in Sierra Leonean Leone</p>
           {isLoaded ? (
            <p className="text-2xl font-semibold text-foreground/80 transition-colors duration-300">
                {isEditing ? formatCurrency(editedTotalSLL, 'SLL') : formatCurrency(totalSLL, 'SLL')}
            </p>
          ) : (
            <Skeleton className="h-8 w-40 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
