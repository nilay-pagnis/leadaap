import { Suspense } from "react";
import { PublicForm, PublicFormLoading } from "./public-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function firstParam(
  v: string | string[] | undefined
): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { formId } = await params;
  const sp = await searchParams;
  const source = firstParam(sp.source);
  const plan = firstParam(sp.plan);
  const pilotMode =
    source === "website" && plan === "free"
      ? { source, plan }
      : null;

  return (
    <div
      className={
        pilotMode
          ? "min-h-screen bg-gradient-to-b from-zinc-100 via-white to-zinc-50"
          : "min-h-screen bg-gradient-to-b from-[#F9FAFB] via-[#F3F4F6]/80 to-[#F9FAFB]"
      }
    >
      <Suspense fallback={<PublicFormLoading />}>
        <PublicForm formId={formId} pilotMode={pilotMode} />
      </Suspense>
    </div>
  );
}
