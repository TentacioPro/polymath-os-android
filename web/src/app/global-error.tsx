"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error boundary — catches unhandled errors across the entire app.
 * This is a required file for @sentry/nextjs to capture React rendering errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#0f172a] text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
          <p className="text-slate-400 max-w-md">
            An unexpected error occurred. The error has been reported automatically.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
