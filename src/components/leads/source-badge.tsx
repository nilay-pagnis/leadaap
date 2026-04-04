import { cn } from "@/lib/utils";
import type { LeadSourceBadgeKind } from "@/lib/leads/resolve-enquiry-source";

const LABELS: Record<LeadSourceBadgeKind, string> = {
  manual: "Manual",
  form: "Form",
  call: "Call",
  whatsapp: "WhatsApp",
  referral: "Referral",
  other: "Other",
};

const STYLES: Record<LeadSourceBadgeKind, string> = {
  manual: "bg-slate-100/90 text-slate-700 ring-1 ring-slate-200/90",
  form: "bg-blue-50 text-blue-800 ring-1 ring-blue-200/80",
  call: "bg-green-50 text-green-800 ring-1 ring-green-200/80",
  whatsapp: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80",
  referral: "bg-violet-50 text-violet-800 ring-1 ring-violet-200/75",
  other: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
};

export type SourceBadgeProps = {
  source: LeadSourceBadgeKind;
  className?: string;
};

/** Small pill for enquiry channel (manual, embedded form, call, etc.). */
export function SourceBadge({ source, className }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-tight",
        STYLES[source],
        className
      )}
    >
      {LABELS[source]}
    </span>
  );
}
