import { createClient } from "@/lib/supabase/server";

/** True when `profiles.role === "admin"` for the signed-in user. */
export async function getCurrentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (data as { role?: string } | null)?.role;
  return role === "admin";
}
