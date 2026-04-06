import { Skeleton } from "@/components/ui/skeleton";

export default function BillingConfirmLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
  );
}
