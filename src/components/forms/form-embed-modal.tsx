"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildEmbedSnippet } from "@/lib/embed-snippet";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formName: string;
};

export function FormEmbedModal({
  open,
  onOpenChange,
  formId,
  formName,
}: Props) {
  const [copied, setCopied] = useState(false);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const snippet = buildEmbedSnippet(origin, formId);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Embed code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the code manually.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Embed enquiry form
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {formName}
              </span>
              {" — "}
              Paste where the form should appear. The script loads{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                embed.js
              </code>{" "}
              once per page; each placeholder gets an isolated iframe pointing at{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                /embed/form/…
              </code>
              . Height resizes automatically; use{" "}
              <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
                data-mode=&quot;modal&quot;
              </code>{" "}
              on the placeholder for a button + modal.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="relative bg-zinc-950 px-5 py-4">
          <pre className="max-h-[min(50vh,320px)] overflow-auto pr-10 text-left text-[13px] leading-relaxed text-zinc-100 sm:text-sm">
            <code>{snippet}</code>
          </pre>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className={cn(
              "absolute right-3 top-3 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            )}
            onClick={() => void copy()}
            aria-label={copied ? "Copied" : "Copy embed code"}
          >
            {copied ? (
              <Check className="size-4 text-emerald-400" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
          </Button>
        </div>

        <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-500">
            <Link
              href="/docs"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Full documentation
            </Link>
            {" · "}
            <span className="tabular-nums text-zinc-400">
              Direct link:{" "}
              <code className="text-zinc-600 dark:text-zinc-300">
                /f/{formId.slice(0, 8)}…
              </code>
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
