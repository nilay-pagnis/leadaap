"use client";

import { useEffect } from "react";

/**
 * Root error boundary — must define its own html/body (Next.js requirement).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error.digest ?? error.message, error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased dark:bg-zinc-950 dark:text-slate-100">
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            Please refresh the page. If the problem continues, try again in a few minutes.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
