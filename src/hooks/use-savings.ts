"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Saving } from '@/types';
import { convertToUSD } from '@/lib/currency';

const SAVINGS_STORAGE_KEY = 'currencyTrackSavings';

export function useSavings() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSavings = localStorage.getItem(SAVINGS_STORAGE_KEY);
      if (storedSavings) {
        setSavings(JSON.parse(storedSavings));
      }
    } catch (error) {
      console.error("Failed to load savings from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(savings));
      } catch (error) {
        console.error("Failed to save savings to localStorage", error);
      }
    }
  }, [savings, isLoaded]);

  const addSaving = useCallback((newSaving: Omit<Saving, 'id' | 'date'>) => {
    const savingWithId: Saving = {
      ...newSaving,
      id: new Date().getTime().toString(),
      date: new Date().toISOString(),
    };
    setSavings(prevSavings => [...prevSavings, savingWithId]);
  }, []);

  const deleteSaving = useCallback((savingId: string) => {
    setSavings(prevSavings => prevSavings.filter(s => s.id !== savingId));
  }, []);

  const totalUSD = useMemo(() => {
    return savings.reduce((total, saving) => {
      return total + convertToUSD(saving.amount, saving.currency);
    }, 0);
  }, [savings]);

  return { savings, addSaving, deleteSaving, totalUSD, isLoaded };
}
