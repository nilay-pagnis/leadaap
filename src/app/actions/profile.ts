"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CompleteProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function completeProfileAction(input: {
  fullName: string;
  companyName?: string;
  jobTitle?: string;
}): Promise<CompleteProfileResult> {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return { ok: false, error: "Please enter your full name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const company = input.companyName?.trim() ?? "";
  const job = input.jobTitle?.trim() ?? "";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      company_name: company || null,
      job_title: job || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
