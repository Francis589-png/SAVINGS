
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import { summarizeSavings } from "@/ai/flows/summarize-savings-flow";
import type { Saving } from "@/types";

type SavingsSummaryCardProps = {
  savings: Saving[];
  isLoaded: boolean;
};

export function SavingsSummaryCard({ savings, isLoaded }: SavingsSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setRecommendation(null);
    
    try {
      const savingsInput = savings.map(s => ({
        date: new Date(s.date).toISOString().split("T")[0],
        amount: s.usdAmount,
        category: s.category,
      }));
      const result = await summarizeSavings({ savingsData: savingsInput });
      setSummary(result.summary);
      setRecommendation(result.recommendation);
    } catch (e) {
      console.error("Error fetching savings summary:", e);
      setError("Could not generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (summary && recommendation) {
        return (
            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-primary mb-1 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Summary</h4>
                    <p className="text-muted-foreground">{summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-accent mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Recommendation</h4>
                    <p className="text-muted-foreground">{recommendation}</p>
                </div>
            </div>
        )
    }

    return (
       <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Get AI-powered insights on your savings habits.</p>
             <Button onClick={handleGetSummary} disabled={!isLoaded || isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Generate Smart Summary"}
            </Button>
       </div>
    );
  };


  if (!isLoaded) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                 <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Smart Summary
                </CardTitle>
                <CardDescription>AI-powered insights into your savings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Summary
        </CardTitle>
        <CardDescription>
            AI-powered insights into your savings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
