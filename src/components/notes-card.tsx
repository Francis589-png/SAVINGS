
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
import { Save, FileText, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SignaturePad } from "@/components/signature-pad";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image";


export function NotesCard() {
  const { note, saveNote, isLoaded } = useNotes();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setSignature(note.signature);
    } else if (isLoaded) {
      setContent("");
      setSignature(undefined);
    }
  }, [note, isLoaded]);

  const handleSaveNote = async () => {
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

  const handleSaveSignature = async (newSignature: string) => {
    setIsSaving(true);
    try {
      // We pass content to avoid overwriting it with an empty string
      await saveNote(content, newSignature);
      setSignature(newSignature);
      toast({
        title: "Signature Saved",
        description: "Your signature has been successfully saved.",
      });
    } catch (error) {
      console.error("Failed to save signature:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your signature. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }
  
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
        <Button onClick={handleSaveNote} disabled={isSaving || !isLoaded} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Note"}
        </Button>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    <span>{signature ? "View/Update Signature" : "Add Signature"}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
               <SignaturePad onSave={handleSaveSignature} initialSignature={signature} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
