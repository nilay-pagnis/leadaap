"use client";

import { PublicFormOnboarding } from "./public-form-onboarding";
import { StepForm, StepFormLoading } from "@/components/form/StepForm";

/** Loading skeleton for `/f/[formId]` — matches Stitch step form layout. */
export { StepFormLoading as PublicFormLoading };

/**
 * Public embed form. Default experience is the Stitch-style step form (`StepForm`).
 * Pilot funnel keeps the legacy onboarding variant.
 */
export function PublicForm({
  formId,
  pilotMode,
}: {
  formId: string;
  /** Website pilot funnel: /f/[id]?source=website&plan=trial */
  pilotMode?: { source: string; plan: string } | null;
}) {
  if (pilotMode) {
    return (
      <PublicFormOnboarding
        formId={formId}
        source={pilotMode.source}
        plan={pilotMode.plan}
      />
    );
  }

  return <StepForm formId={formId} />;
}
