"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { FieldType, LeadFieldDef } from "@/types";

function fieldTypeLabel(t: FieldType): string {
  const m: Record<FieldType, string> = {
    text: "Short text",
    email: "Email",
    phone: "Phone",
    textarea: "Long text",
    select: "Dropdown",
    checkbox: "Checkbox",
  };
  return m[t] ?? t;
}

export type FormDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formName: string;
  fields: LeadFieldDef[];
};

export function FormDetailsDialog({
  open,
  onOpenChange,
  formId,
  formName,
  fields,
}: FormDetailsDialogProps) {
  const sorted = [...fields].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,560px)] gap-0 overflow-hidden rounded-2xl border-slate-200 p-0",
          "sm:max-w-lg"
        )}
      >
        <DialogHeader className="space-y-1 border-b border-slate-200/90 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
            Form details
          </DialogTitle>
          <DialogDescription className="space-y-1 text-left">
            <span className="block text-base font-medium text-slate-900">{formName}</span>
            <span className="block text-xs font-normal text-slate-500">
              {sorted.length === 1
                ? "1 field on this form"
                : `${sorted.length} fields on this form`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(52vh,380px)] overflow-y-auto px-6 py-4">
          {sorted.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No field definitions loaded for this form.
            </p>
          ) : (
            <ul className="space-y-2">
              {sorted.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-sm shadow-sm transition-colors hover:border-slate-200 hover:bg-white"
                >
                  <span className="min-w-0 font-medium leading-snug text-slate-900">
                    {f.label}
                  </span>
                  <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
                    {fieldTypeLabel(f.type)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200/90 bg-slate-50/80 px-6 py-3">
          <Link
            href={`/forms/${formId}`}
            className="inline-flex text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Open in form builder
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
