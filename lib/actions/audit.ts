"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteAuditLogEntries(ids: string[]) {
  if (ids.length === 0) return { data: true };
  const supabase = await createClient();
  const { error } = await supabase.from("audit_log").delete().in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: true };
}
