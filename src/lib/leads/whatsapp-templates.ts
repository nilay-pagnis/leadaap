import type { LeadFieldDef, LeadRow } from "@/types";

export type WhatsAppTemplateCtx = {
  contactName: string;
  formName: string;
  messageSnippet: string;
};

export type WhatsAppTemplate = {
  id: string;
  label: string;
  build: (ctx: WhatsAppTemplateCtx) => string;
};

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** First textarea value, or manual `data.message`. */
export function getLeadMessageSnippet(
  lead: LeadRow,
  fieldDefs: LeadFieldDef[],
  maxLen = 160
): string {
  const data = lead.data ?? {};
  if (lead.form_id == null || lead.form_id === "") {
    const m = data.message;
    return typeof m === "string" ? truncate(m, maxLen) : "";
  }
  const textareas = fieldDefs
    .filter((f) => f.form_id === lead.form_id && f.type === "textarea")
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const f of textareas) {
    const v = data[f.id];
    if (typeof v === "string" && v.trim()) return truncate(v, maxLen);
  }
  return "";
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "thanks",
    label: "Thanks for your enquiry",
    build: ({ contactName, formName, messageSnippet }) => {
      const name = contactName !== "—" ? contactName : "there";
      const tail = messageSnippet ? ` I saw your note: "${messageSnippet}"` : "";
      return `Hi ${name}, thanks for reaching out via ${formName}.${tail} When is a good time to chat?`;
    },
  },
  {
    id: "follow_up",
    label: "Quick follow-up",
    build: ({ contactName, formName }) => {
      const name = contactName !== "—" ? contactName : "there";
      return `Hi ${name}, following up on your ${formName} submission. Do you have a few minutes this week?`;
    },
  },
  {
    id: "details",
    label: "Ask for details",
    build: ({ contactName }) => {
      const name = contactName !== "—" ? contactName : "there";
      return `Hi ${name}, thanks for your interest. Could you share a bit more about what you're looking for so I can help?`;
    },
  },
];
