export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface FormRow {
  id: string;
  user_id: string;
  form_name: string;
  created_at: string;
}

export interface FieldRow {
  id: string;
  form_id: string;
  label: string;
  type: FieldType;
  required: boolean;
  sort_order: number;
  options: string[] | null;
}

export interface LeadRow {
  id: string;
  form_id: string;
  user_id: string;
  data: Record<string, string | boolean | string[]>;
  status: LeadStatus;
  created_at: string;
}

/** Field metadata for displaying lead data (labels + types) */
export interface LeadFieldDef {
  id: string;
  form_id: string;
  label: string;
  type: FieldType;
}
