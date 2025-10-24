
"use client";

import { useMemo, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Note } from '@/types';
import { setDocumentNonBlocking } from '@/firebase';

export function useNotes() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // We use a fixed document ID 'main' since each user has only one note document.
  const noteDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'notes', 'main') : null),
    [firestore, user]
  );

  const { data: note, isLoading: isNoteLoading, error } = useDoc<Note>(noteDocRef);

  const isLoaded = !isUserLoading && !isNoteLoading;

  const saveNote = useCallback(async (content: string) => {
    if (!noteDocRef) {
      throw new Error("User is not authenticated. Cannot save note.");
    };

    const noteData: Note = {
      content,
      updatedAt: new Date().toISOString(),
    };
    
    // Use a non-blocking update for a better UX.
    setDocumentNonBlocking(noteDocRef, noteData, { merge: true });

  }, [noteDocRef]);

  if (error) {
    console.error("Error loading notes:", error);
  }

  return { note, saveNote, isLoaded, error };
}
