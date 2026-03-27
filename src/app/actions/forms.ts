"use server";

import { createClient } from "@/lib/supabase/server";
import { isAtFormLimit, PLAN_LIMITS } from "@/lib/monetization/plans";
import {
  ensureProfile,
  resolveAndSyncProfile,
  type EffectiveProfile,
} from "@/lib/monetization/profile";
import { defaultFieldsForForm } from "@/lib/onboarding-defaults";

export type FormActionResult =
  | { ok: true; formId: string }
  | { ok: false; error: string; code: "UNAUTHORIZED" | "PROFILE" | "FORM_LIMIT" | "DB" };

async function getEffectivePlanForUser(userId: string): Promise<EffectiveProfile> {
  const supabase = await createClient();
  await ensureProfile(supabase, userId);
  const { data: row } = await supabase
    .from("profiles")
    .select("plan, credits")
    .eq("id", userId)
    .maybeSingle();

  if (!row) {
    return {
      id: userId,
      plan: "free",
      credits: PLAN_LIMITS.free.creditAllocation,
    };
  }

  return resolveAndSyncProfile(userId, row);
}

export async function createFormAction(formName: string): Promise<FormActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in", code: "UNAUTHORIZED" };

  const effective = await getEffectivePlanForUser(user.id);

  const { count } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const maxForms = PLAN_LIMITS[effective.plan].maxForms;
  if (isAtFormLimit(count ?? 0, maxForms)) {
    return {
      ok: false,
      error:
        "Upgrade your plan to create more forms — you’ve reached your form limit.",
      code: "FORM_LIMIT",
    };
  }

  const name = formName.trim() || "Untitled form";
  const { data: form, error } = await supabase
    .from("forms")
    .insert({ user_id: user.id, form_name: name })
    .select("id")
    .single();

  if (error || !form) {
    return { ok: false, error: error?.message ?? "Could not create form", code: "DB" };
  }

  return { ok: true, formId: form.id };
}

export async function createOnboardingFormAction(
  formName: string
): Promise<FormActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in", code: "UNAUTHORIZED" };

  const effective = await getEffectivePlanForUser(user.id);

  const { count } = await supabase
    .from("forms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const maxForms = PLAN_LIMITS[effective.plan].maxForms;
  if (isAtFormLimit(count ?? 0, maxForms)) {
    return {
      ok: false,
      error:
        "Form limit reached — upgrade your plan to add another form.",
      code: "FORM_LIMIT",
    };
  }

  const name = formName.trim() || "Contact";
  const { data: form, error: formErr } = await supabase
    .from("forms")
    .insert({ user_id: user.id, form_name: name })
    .select("id")
    .single();

  if (formErr || !form) {
    return {
      ok: false,
      error: formErr?.message ?? "Could not create form",
      code: "DB",
    };
  }

  const rows = defaultFieldsForForm(form.id).map((r) => ({
    ...r,
    options: r.options,
  }));

  const { error: fieldsErr } = await supabase.from("fields").insert(rows);
  if (fieldsErr) {
    await supabase.from("forms").delete().eq("id", form.id);
    return { ok: false, error: fieldsErr.message, code: "DB" };
  }

  return { ok: true, formId: form.id };
}
