import { createClient } from "@/lib/supabase/server";
import { isDevPreview, MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM } from "@/lib/dev/mock-data";
import type { Project, ProjectMember, Task } from "@/lib/types/database";

export async function getProjects() {
  if (isDevPreview()) return MOCK_PROJECTS.filter((p) => !p.archived_at);

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Project[];
}

export async function getProjectById(id: string) {
  if (isDevPreview()) return MOCK_PROJECTS.find((p) => p.id === id) ?? null;

  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  return data as Project | null;
}

export async function getProjectMembers(projectId: string) {
  if (isDevPreview()) {
    return MOCK_TEAM.map((profile) => ({
      project_id: projectId,
      user_id: profile.id,
      role_in_project: profile.role,
      profile,
    })) as ProjectMember[];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("project_id, user_id, role_in_project, profile:profiles(*)")
    .eq("project_id", projectId);
  return (data ?? []) as unknown as ProjectMember[];
}

const TASK_SELECT =
  "*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)";

export async function getProjectTasks(projectId: string) {
  if (isDevPreview()) {
    return MOCK_TASKS.filter((t) => t.project_id === projectId);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("position", { ascending: true });
  return (data ?? []) as unknown as (Task & {
    assignee?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  })[];
}

export async function getAllTeamMembers() {
  if (isDevPreview()) return MOCK_TEAM;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .order("full_name");
  return data ?? [];
}
