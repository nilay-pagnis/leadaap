import { z } from "zod";
import type { FieldRow } from "@/types";

/** Loose international-style phone: optional; if filled, must look plausible. */
const PHONE_OK = /^[+()\d\s\-.\u00a0]{7,}$/;

function phoneField(field: FieldRow) {
  if (field.required) {
    return z
      .string()
      .trim()
      .min(1, "Required")
      .refine((v) => PHONE_OK.test(v), { message: "Enter a valid phone number" });
  }
  return z.string().refine((v) => v.trim() === "" || PHONE_OK.test(v.trim()), {
    message: "Enter a valid phone number",
  });
}

function fieldSchema(field: FieldRow): z.ZodTypeAny {
  switch (field.type) {
    case "checkbox":
      if (field.required) {
        return z
          .boolean()
          .refine((v) => v === true, { message: `Please confirm: ${field.label}` });
      }
      return z.boolean();
    case "email":
      if (field.required) {
        return z
          .string()
          .trim()
          .min(1, "Required")
          .email("Enter a valid email address");
      }
      return z.string().refine(
        (val) => {
          const t = val.trim();
          return t === "" || z.string().email().safeParse(t).success;
        },
        { message: "Enter a valid email address" }
      );
    case "phone":
      return phoneField(field);
    case "textarea":
    case "text":
    case "select":
      if (field.required) {
        return z
          .string()
          .trim()
          .min(1, `Please fill: ${field.label}`);
      }
      return z.string();
    default:
      return z.string();
  }
}

export function buildLeadFormSchema(fields: FieldRow[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    shape[f.id] = fieldSchema(f);
  }
  return z.object(shape);
}

export function buildLeadFormDefaults(fields: FieldRow[]) {
  const initial: Record<string, string | boolean> = {};
  for (const f of fields) {
    initial[f.id] = f.type === "checkbox" ? false : "";
  }
  return initial;
}
