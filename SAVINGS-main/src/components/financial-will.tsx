
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
import { SignaturePad } from "@/components/signature-pad";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FinancialWill() {
  const { note, saveNote, isLoaded } = useNotes();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [signature, setSignature] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isLoaded && note) {
      setContent(note.content);
      setSignature(note.signature);
    }
  }, [isLoaded, note]);
  
  const handleSave = async () => {
    try {
      await saveNote(content, signature);
      toast({
        title: "Notes Saved",
        description: "Your financial notes have been securely saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save your notes. Please try again.",
      });
    }
  };

  const handleSignatureSave = (newSignature: string) => {
    setSignature(newSignature);
  };
  
  if (!isLoaded) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">My Financial Notes</CardTitle>
        <CardDescription>
          A private space for your financial goals, reflections, or will.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your financial notes here..."
          className="min-h-[150px]"
        />
        <div>
            <p className="text-sm font-medium mb-2">Digital Signature</p>
            <SignaturePad onSave={handleSignatureSave} initialSignature={signature} />
        </div>
        <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Notes
        </Button>
      </CardContent>
    </Card>
  );
}
