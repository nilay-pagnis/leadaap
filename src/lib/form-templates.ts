import type { FieldType } from "@/types";

export type FormTemplateId = "contact" | "lead_capture" | "newsletter";

export type TemplateFieldRow = {
  form_id: string;
  label: string;
  type: FieldType;
  required: boolean;
  sort_order: number;
  options: string[];
};

export const FORM_TEMPLATES: {
  id: FormTemplateId;
  formName: string;
  title: string;
  description: string;
}[] = [
  {
    id: "contact",
    formName: "Contact",
    title: "Contact",
    description: "Name, email, and a message — ideal for websites and ads.",
  },
  {
    id: "lead_capture",
    formName: "Lead capture",
    title: "Lead capture",
    description: "Qualify inbound with company and intent fields.",
  },
  {
    id: "newsletter",
    formName: "Newsletter",
    title: "Newsletter",
    description: "Email-only signup with consent checkbox.",
  },
];

export function fieldsForTemplate(formId: string, templateId: FormTemplateId): TemplateFieldRow[] {
  switch (templateId) {
    case "contact":
      return [
        {
          form_id: formId,
          label: "Full name",
          type: "text",
          required: true,
          sort_order: 0,
          options: [],
        },
        {
          form_id: formId,
          label: "Work email",
          type: "email",
          required: true,
          sort_order: 1,
          options: [],
        },
        {
          form_id: formId,
          label: "How can we help?",
          type: "textarea",
          required: false,
          sort_order: 2,
          options: [],
        },
      ];

    case "lead_capture":
      return [
        {
          form_id: formId,
          label: "Full name",
          type: "text",
          required: true,
          sort_order: 0,
          options: [],
        },
        {
          form_id: formId,
          label: "Work email",
          type: "email",
          required: true,
          sort_order: 1,
          options: [],
        },
        {
          form_id: formId,
          label: "Company",
          type: "text",
          required: false,
          sort_order: 2,
          options: [],
        },
        {
          form_id: formId,
          label: "Project budget",
          type: "select",
          required: false,
          sort_order: 3,
          options: ["Under $500", "$500–$2k", "$2k–$10k", "$10k+"],
        },
      ];

    case "newsletter":
      return [
        {
          form_id: formId,
          label: "Email",
          type: "email",
          required: true,
          sort_order: 0,
          options: [],
        },
        {
          form_id: formId,
          label: "I agree to receive updates",
          type: "checkbox",
          required: true,
          sort_order: 1,
          options: [],
        },
      ];

    default:
      return [];
  }
}
