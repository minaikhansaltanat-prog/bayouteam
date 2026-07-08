import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isDevPreview, MOCK_OWNER } from "@/lib/dev/mock-data";
import type { Profile } from "@/lib/types/database";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (isDevPreview()) return MOCK_OWNER;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, avatar_url, phone_whatsapp, position, skills, role, locale, is_blocked, notification_channels, created_at",
    )
    .eq("id", user.id)
    .single();

  return data as Profile | null;
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
