
"use client";

import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/use-notes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function NotesCard() {
  const { note, saveNote, isLoaded } = useNotes();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else if (isLoaded) {
      setContent("");
    }
  }, [note, isLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNote(content);
      toast({
        title: "Note Saved",
        description: "Your notes have been successfully saved.",
      });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your notes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isLoaded) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    My Notes
                </CardTitle>
                 <CardDescription>A private space for your financial thoughts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Notes
        </CardTitle>
        <CardDescription>
            A private space for your financial goals, ideas, or a will.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Write down your financial goals, investment ideas, or a 'financial will'..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <Button onClick={handleSave} disabled={isSaving || !isLoaded} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Note"}
        </Button>
      </CardContent>
    </Card>
  );
}
