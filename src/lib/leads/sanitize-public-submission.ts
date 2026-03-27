import type { FieldType } from "@/types";

/** Field row shape needed for public lead validation (no DB coupling). */
export type FieldForPublicSubmit = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: unknown;
};

export function sanitizePublicLeadData(
  fieldList: FieldForPublicSubmit[],
  data: Record<string, unknown>,
  attribution?: { source?: string; plan?: string }
):
  | { ok: true; sanitized: Record<string, string | boolean> }
  | { ok: false; error: string } {
  const sanitized: Record<string, string | boolean> = {};

  for (const f of fieldList) {
    const key = f.id;
    const raw = data[key];

    if (f.type === "checkbox") {
      const checked = raw === true;
      if (f.required && !checked) {
        return {
          ok: false,
          error: `Please confirm "${f.label}"`,
        };
      }
      sanitized[key] = checked;
      continue;
    }

    const str =
      raw === undefined || raw === null ? "" : String(raw).trim();
    if (f.required && !str) {
      return { ok: false, error: `Field "${f.label}" is required` };
    }

    if (f.type === "select") {
      const opts = Array.isArray(f.options)
        ? (f.options as unknown[]).map(String)
        : [];
      if (str && opts.length > 0 && !opts.includes(str)) {
        return {
          ok: false,
          error: `Invalid choice for "${f.label}"`,
        };
      }
      if (str) sanitized[key] = str;
      continue;
    }

    if (str) sanitized[key] = str;
  }

  const attributionSource = attribution?.source?.trim().slice(0, 120) ?? "";
  const attributionPlan = attribution?.plan?.trim().slice(0, 120) ?? "";
  if (attributionSource) sanitized.source = attributionSource;
  if (attributionPlan) sanitized.plan = attributionPlan;

  return { ok: true, sanitized };
}
