import { Suspense } from "react";
import { EmbedFormPage } from "@/components/embed/embed-form-page";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function EmbedFallback() {
  return (
    <div className="w-full min-w-0 bg-background p-4">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default async function EmbedFormRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<EmbedFallback />}>
      <EmbedFormPage formId={id} />
    </Suspense>
  );
}
