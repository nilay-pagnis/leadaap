import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <Skeleton className="h-48 w-full rounded-2xl lg:w-52" />
        <div className="min-w-0 flex-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
