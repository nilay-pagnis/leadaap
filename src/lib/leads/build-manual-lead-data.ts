import type { FieldType } from "@/types";

export type ManualEnquirySource = "manual" | "call" | "whatsapp" | "referral";

export const MANUAL_SOURCE_OPTIONS: {
  value: ManualEnquirySource;
  label: string;
}[] = [
  { value: "manual", label: "Manual" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Referral" },
];

/**
 * JSON shape for leads with `form_id` null — same keys for display, search, and scoring.
 */
export function buildStandaloneManualLeadData(values: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source: ManualEnquirySource;
}): Record<string, string | boolean> {
  const data: Record<string, string | boolean> = {
    name: values.name.trim(),
    message: values.message.trim(),
    source: values.source,
  };
  if (values.email?.trim()) data.email = values.email.trim();
  if (values.phone?.trim()) data.phone = values.phone.trim();
  return data;
}

export function manualSourceLabel(value: ManualEnquirySource): string {
  return MANUAL_SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const NAME_LIKE = /name|full name|first name/i;
const MESSAGE_LIKE =
  /message|enquiry|details|question|how can we help|description|comments/i;

export type FieldRowForManual = {
  id: string;
  form_id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: unknown;
};

/**
 * Map human manual-entry fields onto a form's field ids (same shape as public submissions).
 */
export function buildManualLeadData(
  fields: FieldRowForManual[],
  formId: string,
  values: {
    name: string;
    email?: string;
    phone?: string;
    message: string;
    source: ManualEnquirySource;
  }
): { ok: true; data: Record<string, string | boolean> } | { ok: false; error: string } {
  const defs = fields
    .filter((f) => f.form_id === formId)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (defs.length === 0) {
    return { ok: false, error: "Form has no fields configured." };
  }

  const nameDef =
    defs.find((f) => f.type === "text" && NAME_LIKE.test(f.label)) ??
    defs.find((f) => f.type === "text");
  const emailDef = defs.find((f) => f.type === "email");
  const phoneDef = defs.find((f) => f.type === "phone");
  const msgDef =
    defs.find((f) => f.type === "textarea" && MESSAGE_LIKE.test(f.label)) ??
    defs.find((f) => f.type === "textarea");

  if (!msgDef) {
    return {
      ok: false,
      error:
        "This form has no message field (textarea). Pick another form or add a long-text field.",
    };
  }

  const data: Record<string, string | boolean> = {};

  if (nameDef) {
    data[nameDef.id] = values.name.trim();
  } else {
    return {
      ok: false,
      error: "This form has no text field for a name. Pick another form.",
    };
  }

  if (emailDef && values.email?.trim()) {
    data[emailDef.id] = values.email.trim();
  }

  if (phoneDef && values.phone?.trim()) {
    data[phoneDef.id] = values.phone.trim();
  }

  data[msgDef.id] = values.message.trim();

  data.source = values.source;

  function selectFirstOption(f: FieldRowForManual): string {
    const opts = Array.isArray(f.options)
      ? (f.options as unknown[]).map(String)
      : [];
    return opts[0] ?? "";
  }

  for (const f of defs) {
    if (f.id in data) continue;
    if (!f.required) continue;

    switch (f.type) {
      case "checkbox":
        data[f.id] = false;
        break;
      case "select": {
        const first = selectFirstOption(f);
        if (!first) {
          return {
            ok: false,
            error: `Required dropdown "${f.label}" has no options — fix the form or choose another.`,
          };
        }
        data[f.id] = first;
        break;
      }
      case "text":
      case "email":
      case "phone":
      case "textarea":
        data[f.id] = "—";
        break;
      default:
        break;
    }
  }

  return { ok: true, data };
}
