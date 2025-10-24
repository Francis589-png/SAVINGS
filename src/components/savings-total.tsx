"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, convertFromUSD } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Pencil, Save, X } from "lucide-react";
import { z } from "zod";

type SavingsTotalProps = {
  totalUSD: number;
  isLoaded: boolean;
  addSaving: (data: { amount: number; currency: 'SLL', category?: string }) => void;
};

const amountSchema = z.coerce.number().min(0, "Total must be a positive number.");

export function SavingsTotal({ totalUSD, isLoaded, addSaving }: SavingsTotalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSLL, setEditedSLL] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);

  const totalSLL = convertFromUSD(totalUSD, 'SLL');

  useEffect(() => {
    if (isLoaded) {
      setEditedSLL(totalSLL.toFixed(0));
    }
  }, [totalSLL, isLoaded]);

  const handleEditClick = () => {
    setEditedSLL(totalSLL.toFixed(0));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = () => {
    const validation = amountSchema.safeParse(editedSLL);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }
    
    const newTotalSLL = validation.data;
    const difference = newTotalSLL - totalSLL;

    if (Math.abs(difference) > 0.001) {
      addSaving({
        amount: difference,
        currency: 'SLL',
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
          <p className="text-sm text-muted-foreground">in Sierra Leonean Leone</p>
           {isLoaded ? (
            isEditing ? (
              <div className="mt-1">
                <div className="flex items-center gap-2">
                   <Input
                      type="number"
                      value={editedSLL}
                      onChange={(e) => {
                        setEditedSLL(e.target.value);
                        setError(null);
                      }}
                      className="text-4xl font-bold text-primary h-auto p-0 border-0 shadow-none focus-visible:ring-0"
                      step="1"
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
                <p className="text-4xl font-bold text-primary transition-colors duration-300">
                    {formatCurrency(totalSLL, 'SLL')}
                </p>
            )
          ) : (
            <Skeleton className="h-10 w-48 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
