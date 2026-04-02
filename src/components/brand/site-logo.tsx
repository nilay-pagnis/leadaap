import { cn } from "@/lib/utils";
import { EnquireoMark, type EnquireoMarkTone } from "@/components/brand/enquireo-mark";

const sizeStyles: Record<
  "xs" | "sm" | "md" | "lg" | "xl",
  { box: string; dim: number }
> = {
  xs: { box: "size-10", dim: 40 },
  sm: { box: "size-11", dim: 44 },
  md: { box: "size-14", dim: 56 },
  lg: { box: "size-16", dim: 64 },
  xl: { box: "size-[4.5rem]", dim: 72 },
};

export type SiteLogoSize = keyof typeof sizeStyles;

type Props = {
  /** Mark only: scales with breakpoint (64px → 72px). */
  responsive?: boolean;
  size?: SiteLogoSize;
  className?: string;
  /**
   * `mark` — gradient icon only (dashboard, auth, compact UI).
   * `full` — horizontal lockup: mark + wordmark (marketing header/footer).
   */
  variant?: "mark" | "full";
  /** Monochrome mark for print / dark surfaces (mark variant). */
  markTone?: EnquireoMarkTone;
  /** Indigo glow on the mark (color only). */
  markGlow?: boolean;
};

/**
 * Enquireo brand: vector mark + Inter wordmark. Static SVGs: `/brand/enquireo-*.svg`.
 */
export function SiteLogo({
  responsive,
  size = "lg",
  className,
  variant = "mark",
  markTone = "color",
  markGlow = true,
}: Props) {
  if (variant === "full") {
    return (
      <div
        className={cn(
          "relative flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3",
          className
        )}
      >
        <EnquireoMark
          tone={markTone}
          glow={markTone === "color" && markGlow}
          className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          title="Enquireo"
        />
        <span
          className={cn(
            "truncate font-semibold tracking-tight text-slate-900",
            "text-[1.125rem] leading-none sm:text-xl"
          )}
        >
          Enquireo
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        responsive ? "size-16 sm:size-[4.5rem]" : sizeStyles[size].box,
        className
      )}
    >
      <EnquireoMark
        tone={markTone}
        glow={markTone === "color" && markGlow}
        className="h-full w-full"
        title="Enquireo"
      />
    </div>
  );
}
