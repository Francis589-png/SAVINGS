
"use client";

import { useMemo, useCallback } from 'react';
import { collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Reminder, ReminderEntry } from '@/types';

export function useReminders() {
  const { user } = useUser();
  const firestore = useFirestore();

  const remindersCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'reminders') : null),
    [firestore, user]
  );

  const { data: reminders, isLoading, error } = useCollection<Reminder>(remindersCollectionRef);

  const addReminder = useCallback((text: string) => {
    if (!remindersCollectionRef) return;

    const reminderEntry: ReminderEntry = {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addDocumentNonBlocking(remindersCollectionRef, reminderEntry);
  }, [remindersCollectionRef]);

  const toggleReminder = useCallback((reminderId: string, completed: boolean) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'reminders', reminderId);
    updateDoc(docRef, { completed: !completed });
  }, [firestore, user]);

  const deleteReminder = useCallback((reminderId: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'reminders', reminderId);
    deleteDocumentNonBlocking(docRef);
  }, [firestore, user]);

  const sortedReminders = useMemo(() => {
    if (!reminders) return [];
    return [...reminders].sort((a, b) => {
        if (a.completed === b.completed) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.completed ? 1 : -1;
    });
  }, [reminders]);

  if (error) {
    console.error("Error loading reminders:", error);
  }

  return { reminders: sortedReminders, addReminder, toggleReminder, deleteReminder, isLoading };
}
