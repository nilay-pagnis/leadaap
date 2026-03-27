"use client";

/**
 * Subtle premium light backdrop (Stripe/Linear-style).
 */
export function LightCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-[#F8FAFC]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(79,70,229,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.9))]" />
    </div>
  );
}
