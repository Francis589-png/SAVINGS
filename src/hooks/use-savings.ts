"use client";

import { useMemo, useCallback } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Saving, SavingEntry, Currency } from '@/types';
import { convertToUSD } from '@/lib/currency';

export function useSavings() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const savingsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'savingsEntries') : null),
    [firestore, user]
  );

  const { data: savings, isLoading: areSavingsLoading, error } = useCollection<SavingEntry>(savingsCollectionRef);

  const isLoaded = !isUserLoading && !areSavingsLoading;

  const addSaving = useCallback((newSaving: { amount: number, currency: Currency, category?: string }) => {
    if (!savingsCollectionRef) return;

    const savingEntry: SavingEntry = {
      amount: newSaving.amount,
      currency: newSaving.currency,
      category: newSaving.category || 'General',
      entryDate: new Date().toISOString(),
      usdAmount: convertToUSD(newSaving.amount, newSaving.currency)
    };

    addDocumentNonBlocking(savingsCollectionRef, savingEntry);
  }, [savingsCollectionRef]);

  const deleteSaving = useCallback((savingId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'savingsEntries', savingId);
    deleteDocumentNonBlocking(docRef);
  }, [firestore, user]);

  const totalUSD = useMemo(() => {
    if (!isLoaded || !savings) {
      return 0;
    }
    return savings.reduce((total, saving) => total + saving.usdAmount, 0);
  }, [savings, isLoaded]);

  const savingsWithDate: Saving[] = useMemo(() => {
    return (savings || []).map(s => ({...s, id: s.id, date: s.entryDate, currency: 'SLL' as const, category: s.category || 'General' }))
  }, [savings]);

  if (error) {
    console.error("Error loading savings:", error);
  }

  return { savings: savingsWithDate, addSaving, deleteSaving, totalUSD, isLoaded };
}
