import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full min-w-0 max-w-7xl px-6", className)}>
      {children}
    </div>
  );
}
