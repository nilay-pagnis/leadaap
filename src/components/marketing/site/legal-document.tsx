import type { ReactNode } from "react";

export function LegalDocument({
  title,
  intro,
  lastUpdated,
  children,
}: {
  title: string;
  intro?: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{title}</h1>
      {lastUpdated ? (
        <p className="mt-2 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
      ) : null}
      {intro ? <p className="mt-6 text-lg leading-relaxed text-zinc-600">{intro}</p> : null}
      <div className="mt-10 space-y-10 text-zinc-600">{children}</div>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">{children}</div>
    </section>
  );
}
