"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types/database";

export async function inviteMember(email: string, role: Role = "member") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("allowed_emails")
    .insert({ email: email.trim().toLowerCase(), invited_role: role, invited_by: user?.id });
  if (error) return { error: error.message };

  await supabase.from("audit_log").insert({
    user_id: user?.id,
    action: "member.invite",
    resource: `email:${email}`,
    details: { role },
  });

  revalidatePath("/admin");
  return { data: true };
}

export async function changeUserRole(userId: string, role: Role) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: true };
}

export async function setUserBlocked(userId: string, isBlocked: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_blocked: isBlocked })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: true };
}

export async function setErrorLimit(userId: string, errorLimit: number | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("member_limits")
    .upsert({ user_id: userId, error_limit: errorLimit }, { onConflict: "user_id" });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: true };
}

export async function setDelegatedPermission(
  userId: string,
  flag:
    | "can_manage_bonuses"
    | "can_view_analytics"
    | "can_grant_file_access"
    | "can_create_share_links"
    | "can_export_all",
  value: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("delegated_permissions")
    .upsert({ user_id: userId, [flag]: value }, { onConflict: "user_id" });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: true };
}
