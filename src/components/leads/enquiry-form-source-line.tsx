import { cn } from "@/lib/utils";
import { getEnquiryFormSourceDisplay } from "@/lib/leads/resolve-enquiry-source";
import { SourceBadge } from "@/components/leads/source-badge";
import type { LeadRow } from "@/types";

export { SourceBadge } from "@/components/leads/source-badge";
export type { LeadSourceBadgeKind } from "@/lib/leads/resolve-enquiry-source";

export type EnquiryFormSourceLineProps = {
  lead: LeadRow;
  formNames: Record<string, string>;
  className?: string;
  /** Applied to the title span (e.g. line-clamp for tables). */
  titleClassName?: string;
};

/** Form / manual title plus `SourceBadge` — use in list, cards, and detail. */
export function EnquiryFormSourceLine({
  lead,
  formNames,
  className,
  titleClassName,
}: EnquiryFormSourceLineProps) {
  const { title, source } = getEnquiryFormSourceDisplay(lead, formNames);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-1.5",
        className
      )}
    >
      <span
        className={cn(
          "min-w-0 font-medium text-slate-900",
          titleClassName
        )}
      >
        {title}
      </span>
      <SourceBadge source={source} />
    </div>
  );
}
