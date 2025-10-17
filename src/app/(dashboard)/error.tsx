'use client';

import { useEffect } from 'react';
import { Button } from '@/primitives/button';
import { AlertCircle, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="size-16 text-red-500" />
        <h2 className="text-2xl font-bold">Dashboard Error</h2>
        <p className="max-w-md text-foreground-muted">
          {error.message ||
            'An error occurred while loading the dashboard. Please try again.'}
        </p>
        {error.digest && (
          <p className="text-xs text-foreground-muted">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/app">
            <Home className="mr-2 size-4" />
            Dashboard Home
          </a>
        </Button>
      </div>
    </div>
  );
}
