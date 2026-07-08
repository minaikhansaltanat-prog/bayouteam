import { createClient } from "@/lib/supabase/server";
import { isDevPreview, MOCK_TEAM } from "@/lib/dev/mock-data";
import type { AuditLogEntry, Profile } from "@/lib/types/database";

export interface MemberWithLimit extends Profile {
  error_limit?: number | null;
  error_count?: number;
}

export async function getAllMembers(): Promise<MemberWithLimit[]> {
  if (isDevPreview()) return MOCK_TEAM.map((p) => ({ ...p, error_limit: 5, error_count: 1 }));

  const supabase = await createClient();
  const [{ data: profiles }, { data: limits }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("member_limits").select("*"),
  ]);

  const limitMap = new Map((limits ?? []).map((l) => [l.user_id, l]));
  return (profiles ?? []).map((p) => ({
    ...p,
    error_limit: limitMap.get(p.id)?.error_limit ?? null,
    error_count: limitMap.get(p.id)?.error_count ?? 0,
  })) as MemberWithLimit[];
}

export async function getAuditLog(limit = 50) {
  if (isDevPreview()) return [] as (AuditLogEntry & { profile?: Profile })[];

  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*, profile:profiles(id, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as (AuditLogEntry & { profile?: Profile })[];
}
