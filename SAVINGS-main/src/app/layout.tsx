
'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { SplashScreen } from '@/components/splash-screen';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep the branded splash visible long enough to actually see the
    // JUSU letter-by-letter animation on fast connections.
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CurrencyTrack</title>
        <meta name="description" content="Track your savings across different currencies." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3A6B4B" />
        <meta name="msapplication-TileColor" content="#3A6B4B" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        {isLoading ? (
          <SplashScreen />
        ) : (
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
