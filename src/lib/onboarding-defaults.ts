/** Default fields for the fast “first form” onboarding path */
export const ONBOARDING_DEFAULT_FORM_NAME = "Contact";

export function defaultFieldsForForm(formId: string) {
  return [
    {
      form_id: formId,
      label: "Full name",
      type: "text" as const,
      required: true,
      sort_order: 0,
      options: [] as string[],
    },
    {
      form_id: formId,
      label: "Work email",
      type: "email" as const,
      required: true,
      sort_order: 1,
      options: [],
    },
    {
      form_id: formId,
      label: "How can we help?",
      type: "textarea" as const,
      required: false,
      sort_order: 2,
      options: [],
    },
  ];
}
