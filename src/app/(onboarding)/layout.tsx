export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f9fc] bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(99,102,241,0.12),transparent)]">
      {children}
    </div>
  );
}
