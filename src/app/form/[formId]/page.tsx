import { StepForm } from "@/components/form/StepForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicStitchFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] via-[#F3F4F6]/80 to-[#F9FAFB]">
      <StepForm formId={formId} />
    </div>
  );
}
