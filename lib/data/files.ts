import { createClient } from "@/lib/supabase/server";
import { isDevPreview } from "@/lib/dev/mock-data";
import type { FileRecord } from "@/lib/types/database";

export async function getProjectFiles(projectId: string) {
  if (isDevPreview()) return [] as (FileRecord & { uploader?: { full_name: string | null } })[];

  const supabase = await createClient();
  const { data } = await supabase
    .from("files")
    .select("*, uploader:profiles!files_owner_id_fkey(full_name)")
    .eq("scope", "project")
    .eq("scope_id", projectId)
    .order("created_at", { ascending: false });
  return (data ?? []) as (FileRecord & { uploader?: { full_name: string | null } })[];
}
