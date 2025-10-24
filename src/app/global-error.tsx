'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-destructive">Oops! Something Went Wrong</CardTitle>
                    <CardDescription className="pt-2">
                        We've encountered an unexpected issue. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="text-left bg-muted p-3 rounded-md text-xs overflow-auto max-h-40 border">
                            <p className="font-mono text-destructive">{error.message}</p>
                        </div>
                    )}
                    <Button onClick={() => reset()} size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
      </body>
    </html>
  );
}
