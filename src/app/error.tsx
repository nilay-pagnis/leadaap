"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error.digest ?? error.message, error);
  }, [error]);

  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-4 py-16",
        "bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900"
      )}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle className="size-7" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We couldn&apos;t load this page. Your data is safe — try again, or go back to your workspace.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-left font-mono text-xs text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
            {error.message}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => reset()} className="rounded-xl font-semibold">
            Try again
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-xl text-slate-600"
            )}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
