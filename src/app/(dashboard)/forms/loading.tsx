import { Skeleton } from "@/components/ui/skeleton";

export default function FormsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <Skeleton className="h-[320px] w-full rounded-2xl" />
    </div>
  );
}
