import Image from "next/image";
import { cn } from "@/lib/utils";

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
  priority?: boolean;
  /**
   * `mark` — gradient icon only (dashboard, auth, compact UI).
   * `full` — horizontal logo with wordmark (marketing header/footer).
   */
  variant?: "mark" | "full";
};

/**
 * Enquireo brand assets: `/images/enquireo-mark.png`, `/images/enquireo-logo-full.png`.
 */
export function SiteLogo({
  responsive,
  size = "lg",
  className,
  priority,
  variant = "mark",
}: Props) {
  if (variant === "full") {
    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center",
          className
        )}
      >
        <Image
          src="/images/enquireo-logo-full.png"
          alt="Enquireo"
          width={280}
          height={68}
          className="h-10 w-auto sm:h-11 md:h-12"
          priority={priority}
          sizes="(max-width: 640px) 220px, 280px"
        />
      </div>
    );
  }

  const dim = responsive ? 72 : sizeStyles[size].dim;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70",
        responsive ? "size-16 sm:size-[4.5rem]" : sizeStyles[size].box,
        className
      )}
    >
      <Image
        src="/images/enquireo-mark.png"
        alt="Enquireo"
        width={dim}
        height={dim}
        className="h-full w-full object-contain p-[10%]"
        priority={priority}
      />
    </div>
  );
}
