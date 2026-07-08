import { createClient } from "@/lib/supabase/server";
import { isDevPreview } from "@/lib/dev/mock-data";
import type { Meeting } from "@/lib/types/database";

type MeetingWithProject = Meeting & {
  project?: { id: string; name: string } | null;
  secretary?: { id: string; full_name: string | null } | null;
};

export async function getMeetings(projectId?: string) {
  if (isDevPreview()) return [] as MeetingWithProject[];

  const supabase = await createClient();
  let query = supabase
    .from("meetings")
    .select("*, project:projects(id, name), secretary:profiles!meetings_secretary_id_fkey(id, full_name)")
    .order("date", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data } = await query;
  return (data ?? []) as unknown as MeetingWithProject[];
}
