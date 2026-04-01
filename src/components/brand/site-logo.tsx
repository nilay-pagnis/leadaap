import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeStyles: Record<
  "xs" | "sm" | "md" | "lg" | "xl",
  { box: string; dim: number }
> = {
  xs: { box: "size-9", dim: 36 },
  sm: { box: "size-10", dim: 40 },
  md: { box: "size-12", dim: 48 },
  lg: { box: "size-14", dim: 56 },
  xl: { box: "size-16", dim: 64 },
};

export type SiteLogoSize = keyof typeof sizeStyles;

type Props = {
  /** Default matches home header at `lg` breakpoint: 56px → 64px. */
  responsive?: boolean;
  size?: SiteLogoSize;
  className?: string;
  priority?: boolean;
};

/**
 * Brand mark (`/images/leadapp-logo.png`).
 */
export function SiteLogo({
  responsive,
  size = "lg",
  className,
  priority,
}: Props) {
  const dim = 64;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80",
        responsive ? "size-14 sm:size-16" : sizeStyles[size].box,
        className
      )}
    >
      <Image
        src="/images/leadapp-logo.png"
        alt="LeadApp logo"
        width={dim}
        height={dim}
        className="h-full w-full object-cover"
        priority={priority}
      />
    </div>
  );
}
