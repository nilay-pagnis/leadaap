import type { LeadFieldDef, LeadRow } from "@/types";

export type LeadScoreLabel = "Hot" | "Warm" | "Cold";

export type LeadScoreLine = {
  points: number;
  label: string;
};

export type LeadScoreResult = {
  score: number;
  label: LeadScoreLabel;
  /** Contributing factors (points &gt; 0 only). */
  lines: LeadScoreLine[];
  /** Short UX copy for trust and next steps. */
  explanation: string;
};

const FREE_EMAIL_DOMAINS = new Set(
  [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "yahoo.fr",
    "hotmail.com",
    "hotmail.co.uk",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "protonmail.com",
    "proton.me",
    "pm.me",
    "mail.com",
    "gmx.com",
    "gmx.net",
    "yandex.com",
    "zoho.com",
    "hey.com",
    "fastmail.com",
    "duck.com",
    "tutanota.com",
    "tuta.io",
  ].map((d) => d.toLowerCase())
);

const SCORE_KEYWORDS = ["urgent", "price", "demo", "call"] as const;

function getEmailDomain(email: string): string | null {
  const t = email.trim().toLowerCase();
  const at = t.lastIndexOf("@");
  if (at < 0 || at === t.length - 1) return null;
  return t.slice(at + 1).replace(/^www\./, "");
}

function emailScoreAndLine(email: string): { points: number; line?: LeadScoreLine } {
  if (!email || email === "—") return { points: 0 };
  const domain = getEmailDomain(email);
  if (!domain) return { points: 0 };
  if (FREE_EMAIL_DOMAINS.has(domain)) {
    return { points: 5, line: { points: 5, label: "Personal email" } };
  }
  return { points: 20, line: { points: 20, label: "Business email" } };
}

function hasPhone(lead: LeadRow, fieldDefs: LeadFieldDef[]): boolean {
  if (lead.form_id == null || lead.form_id === "") {
    const v = lead.data?.phone;
    return typeof v === "string" && !!v.trim();
  }
  const defs = fieldDefs.filter(
    (f) => f.form_id === lead.form_id && f.type === "phone"
  );
  for (const f of defs) {
    const v = lead.data?.[f.id];
    if (typeof v === "string" && v.trim()) return true;
  }
  return false;
}

function getLeadEmail(lead: LeadRow, fieldDefs: LeadFieldDef[]): string {
  if (lead.form_id == null || lead.form_id === "") {
    const v = lead.data?.email;
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }
  const defs = fieldDefs.filter((f) => f.form_id === lead.form_id);
  const emailFields = defs.filter((f) => f.type === "email");
  for (const f of emailFields) {
    const v = lead.data?.[f.id];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  return "";
}

function getMessageText(lead: LeadRow, fieldDefs: LeadFieldDef[]): string {
  if (lead.form_id == null || lead.form_id === "") {
    const v = lead.data?.message;
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }
  const defs = fieldDefs.filter(
    (f) => f.form_id === lead.form_id && f.type === "textarea"
  );
  const parts: string[] = [];
  for (const f of defs) {
    const v = lead.data?.[f.id];
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
  }
  return parts.join(" ").trim();
}

function messageLengthScoreAndLine(len: number): { points: number; line: LeadScoreLine } {
  if (len < 20) {
    return { points: 5, line: { points: 5, label: "Brief message" } };
  }
  if (len <= 100) {
    return { points: 15, line: { points: 15, label: "Substantial message" } };
  }
  return { points: 25, line: { points: 25, label: "Detailed message" } };
}

function formNameScoreAndLine(formName: string): { points: number; line?: LeadScoreLine } {
  const n = formName.trim().toLowerCase();
  if (!n) return { points: 0 };
  if (n.includes("demo")) {
    return {
      points: 25,
      line: { points: 25, label: "Demo request form" },
    };
  }
  if (n.includes("contact")) {
    return {
      points: 10,
      line: { points: 10, label: "Contact form" },
    };
  }
  return { points: 0 };
}

function keywordScoreAndLine(messageLower: string): { points: number; line?: LeadScoreLine } {
  for (const kw of SCORE_KEYWORDS) {
    if (messageLower.includes(kw)) {
      return {
        points: 20,
        line: { points: 20, label: "High intent keywords" },
      };
    }
  }
  return { points: 0 };
}

function labelFromScore(score: number): LeadScoreLabel {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function explanationForLabel(label: LeadScoreLabel): string {
  switch (label) {
    case "Hot":
      return "This enquiry shows strong buying intent. Prioritize follow-up.";
    case "Warm":
      return "Several positive signals. Worth a timely follow-up when you can.";
    case "Cold":
      return "Fewer urgency signals from this submission. Qualify further or add to nurture.";
    default:
      return "";
  }
}

export type CalculateLeadScoreInput = {
  lead: LeadRow;
  formNames: Record<string, string>;
  fieldDefs: LeadFieldDef[];
};

/**
 * Heuristic lead score (0–100) from enquiry data + form metadata.
 * Includes line items and explanation copy for transparent UX.
 */
export function calculateLeadScore({
  lead,
  formNames,
  fieldDefs,
}: CalculateLeadScoreInput): LeadScoreResult {
  const lines: LeadScoreLine[] = [];
  let score = 0;

  const email = getLeadEmail(lead, fieldDefs);
  const emailPart = emailScoreAndLine(email);
  score += emailPart.points;
  if (emailPart.line) lines.push(emailPart.line);

  if (hasPhone(lead, fieldDefs)) {
    score += 10;
    lines.push({ points: 10, label: "Phone provided" });
  }

  const message = getMessageText(lead, fieldDefs);
  const msgPart = messageLengthScoreAndLine(message.length);
  score += msgPart.points;
  lines.push(msgPart.line);

  const formName =
    lead.form_id != null && lead.form_id !== ""
      ? (formNames[lead.form_id] ?? "")
      : "";
  const formPart = formNameScoreAndLine(formName);
  score += formPart.points;
  if (formPart.line) lines.push(formPart.line);

  const kwPart = keywordScoreAndLine(message.toLowerCase());
  score += kwPart.points;
  if (kwPart.line) lines.push(kwPart.line);

  const clamped = Math.max(0, Math.min(100, score));
  const label = labelFromScore(clamped);

  return {
    score: clamped,
    label,
    lines,
    explanation: explanationForLabel(label),
  };
}
