import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-4 py-16",
        "bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900"
      )}
    >
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">404</p>
        <div className="mx-auto mt-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300">
          <FileQuestion className="size-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          That link may be outdated or the page was moved. Head back to Enquireo and keep capturing leads.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-xl font-semibold"
            )}
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            Dashboard
          </Link>
          <Link
            href="/inbox"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-xl text-slate-600"
            )}
          >
            Inbox
          </Link>
        </div>
      </div>
    </div>
  );
}
