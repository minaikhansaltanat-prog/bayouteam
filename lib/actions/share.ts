"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ShareMode } from "@/lib/types/database";

export interface CreateShareLinkInput {
  resource_type: "task" | "project" | "meeting";
  resource_id: string;
  mode: ShareMode;
  expiresInHours?: number | null;
  password?: string;
}

export async function createShareLink(input: CreateShareLinkInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const expires_at = input.expiresInHours
    ? new Date(Date.now() + input.expiresInHours * 3600 * 1000).toISOString()
    : null;

  let password_hash: string | null = null;
  if (input.password) {
    const { data } = await supabase.rpc("crypt_password", { plain: input.password });
    password_hash = data ?? null;
  }

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      resource_type: input.resource_type,
      resource_id: input.resource_id,
      mode: input.mode,
      expires_at,
      password_hash,
      created_by: user.id,
    })
    .select("id, token")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { data };
}

export async function revokeShareLink(linkId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("share_links")
    .update({ revoked: true })
    .eq("id", linkId);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { data: true };
}
