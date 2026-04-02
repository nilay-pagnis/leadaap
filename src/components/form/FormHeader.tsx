"use client";

type FormHeaderProps = {
  /** From form owner profile — drives “Company × Enquireo” vs “Form by Enquireo”. */
  companyName?: string | null;
};

/**
 * Stitch-style hero: dynamic branding + centered subtext.
 */
export function FormHeader({
  companyName,
}: FormHeaderProps) {
  const trimmed = companyName?.trim();
  const title = trimmed ? `${trimmed} × Enquireo` : "Form by Enquireo";

  return (
    <header className="text-center">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
        {title}
      </h1>
    </header>
  );
}
