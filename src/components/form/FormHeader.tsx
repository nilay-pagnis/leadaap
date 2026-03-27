"use client";

type FormHeaderProps = {
  /** From form owner profile — drives “Company × LeadAap” vs “Form by LeadAap”. */
  companyName?: string | null;
  /** Optional form name displayed under brand title. */
  formName?: string;
};

/**
 * Stitch-style hero: dynamic branding + centered subtext.
 */
export function FormHeader({
  companyName,
  formName,
}: FormHeaderProps) {
  const trimmed = companyName?.trim();
  const title = trimmed ? `${trimmed} × LeadAap` : "Form by LeadAap";
  const formLabel = formName?.trim();

  return (
    <header className="text-center">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
        {title}
      </h1>
      {formLabel ? (
        <p className="mx-auto mt-3 max-w-xl text-pretty text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
          {formLabel}
        </p>
      ) : null}
    </header>
  );
}
