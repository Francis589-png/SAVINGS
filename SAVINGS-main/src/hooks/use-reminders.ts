
"use client";

import { useMemo, useCallback } from 'react';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { Reminder, ReminderEntry } from '@/types';

export function useReminders() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const remindersCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'reminders') : null),
    [firestore, user]
  );
  
  const remindersQuery = useMemoFirebase(
    () => (remindersCollectionRef ? query(remindersCollectionRef, orderBy('createdAt', 'desc')) : null),
    [remindersCollectionRef]
  );

  const { data: remindersData, isLoading: areRemindersLoading, error } = useCollection<ReminderEntry>(remindersQuery);

  const isLoaded = !isUserLoading && !areRemindersLoading;

  const addReminder = useCallback((text: string) => {
    if (!remindersCollectionRef) return;

    const reminderEntry: ReminderEntry = {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(remindersCollectionRef, reminderEntry);
  }, [remindersCollectionRef]);

  const toggleReminder = useCallback((id: string, currentStatus: boolean) => {
      if (!user) return;
      const docRef = doc(firestore, 'users', user.uid, 'reminders', id);
      updateDocumentNonBlocking(docRef, { completed: !currentStatus });
  }, [firestore, user]);

  const deleteReminder = useCallback((reminderId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'reminders', reminderId);
    deleteDocumentNonBlocking(docRef);
  }, [firestore, user]);
  
  const reminders: Reminder[] = useMemo(() => {
    return (remindersData || []).map(r => ({ ...r, id: r.id }));
  }, [remindersData]);

  if (error) {
    console.error("Error loading reminders:", error);
  }

  return { reminders, addReminder, toggleReminder, deleteReminder, isLoaded };
}
