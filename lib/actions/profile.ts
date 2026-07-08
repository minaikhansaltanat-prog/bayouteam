"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationChannel } from "@/lib/types/database";

export interface ProfileFormInput {
  full_name?: string;
  position?: string;
  phone_whatsapp?: string;
  skills?: string[];
  avatar_url?: string;
  locale?: "kk" | "ru";
  notification_channels?: NotificationChannel[];
}

export async function updateProfile(input: ProfileFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("profiles").update(input).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { data: true };
}
