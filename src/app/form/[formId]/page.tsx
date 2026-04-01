import { StepForm } from "@/components/form/StepForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicStitchFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  return <StepForm formId={formId} />;
}
