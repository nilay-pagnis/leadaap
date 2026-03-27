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
          : "relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_48%),radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.16),_transparent_45%),linear-gradient(180deg,_#f8faff_0%,_#f3f6ff_50%,_#eef3ff_100%)]"
      }
    >
      {!pilotMode ? (
        <>
          <div className="pointer-events-none absolute -left-28 top-24 size-[320px] rounded-full bg-indigo-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-1/3 size-[300px] rounded-full bg-violet-300/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-80px] left-1/3 size-[280px] rounded-full bg-sky-300/20 blur-3xl" />
        </>
      ) : null}
      <Suspense fallback={<PublicFormLoading />}>
        <PublicForm formId={formId} pilotMode={pilotMode} />
      </Suspense>
    </div>
  );
}
