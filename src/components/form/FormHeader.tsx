"use client";

type FormHeaderProps = {
  /** From form owner profile — drives “Company × LeadAap” vs “Form by LeadAap”. */
  companyName?: string | null;
  /** Shown in subtext when set. */
  formName?: string;
  /** Overrides default subtext. */
  subtext?: string;
};

/**
 * Stitch-style hero: dynamic branding + centered subtext.
 */
export function FormHeader({
  companyName,
  formName,
  subtext,
}: FormHeaderProps) {
  const trimmed = companyName?.trim();
  const title = trimmed ? `${trimmed} × LeadAap` : "Form by LeadAap";

  const defaultSubtext =
    "Tell us about your project. We'll help you find the perfect solution in under 2 minutes.";
  const line =
    subtext ??
    (formName?.trim()
      ? `${formName.trim()} — ${defaultSubtext}`
      : defaultSubtext);

  return (
    <header className="text-center">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
        {line}
      </p>
    </header>
  );
}
