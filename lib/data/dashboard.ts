import { createClient } from "@/lib/supabase/server";
import { isDevPreview, MOCK_TASKS, MOCK_PROJECTS } from "@/lib/dev/mock-data";
import type { Task } from "@/lib/types/database";

const TASK_SELECT =
  "id, project_id, title, description, status, priority, color, due_at, bonus_type, bonus_value, checklist, tags, assignee_id, helpers, created_at, project:projects(id, name, logo_url), assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)";

export async function getMyTasks(userId: string) {
  if (isDevPreview()) {
    return MOCK_TASKS.filter(
      (task) => task.status !== "done" && (task.assignee_id === userId || task.helpers.includes(userId)),
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .is("deleted_at", null)
    .neq("status", "done")
    .or(`assignee_id.eq.${userId},helpers.cs.{${userId}}`)
    .order("due_at", { ascending: true, nullsFirst: false });

  return (data ?? []) as unknown as (Task & {
    project: { id: string; name: string; logo_url: string | null };
  })[];
}

export async function getQuickStats(userId: string) {
  if (isDevPreview()) {
    return {
      activeProjects: MOCK_PROJECTS.filter((p) => p.status === "active").length,
      completedThisWeek: MOCK_TASKS.filter(
        (t) => t.status === "done" && t.assignee_id === userId,
      ).length,
    };
  }

  const supabase = await createClient();

  const [{ count: activeProjects }, { count: completedThisWeek }] = await Promise.all([
    supabase
      .from("project_members")
      .select("project_id, projects!inner(status)", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("projects.status", "active"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("assignee_id", userId)
      .eq("status", "done")
      .gte(
        "updated_at",
        new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      ),
  ]);

  return {
    activeProjects: activeProjects ?? 0,
    completedThisWeek: completedThisWeek ?? 0,
  };
}
