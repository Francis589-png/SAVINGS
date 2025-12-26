
'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { SplashScreen } from '@/components/splash-screen';

// This metadata is still useful for SEO, but we'll control the title dynamically.
// export const metadata: Metadata = {
//   title: 'CurrencyTrack',
//   description: 'Track your savings across different currencies.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CurrencyTrack</title>
        <meta name="description" content="Track your savings across different currencies." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3A6B4B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
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
