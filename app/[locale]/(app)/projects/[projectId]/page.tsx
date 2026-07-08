import { setRequestLocale } from "next-intl/server";
import { getProjectMembers, getProjectTasks } from "@/lib/data/projects";
import { getCurrentProfile } from "@/lib/actions/auth";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { ROLE_ORDER } from "@/lib/types/database";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const [profile, tasks, members] = await Promise.all([
    getCurrentProfile(),
    getProjectTasks(projectId),
    getProjectMembers(projectId),
  ]);

  if (!profile) return null;

  const projectRole = members.find((m) => m.user_id === profile.id)?.role_in_project;
  const canEdit =
    ROLE_ORDER.indexOf(profile.role) <= ROLE_ORDER.indexOf("admin") ||
    (projectRole && ROLE_ORDER.indexOf(projectRole) <= ROLE_ORDER.indexOf("editor"));

  return (
    <KanbanBoard
      projectId={projectId}
      initialTasks={tasks}
      members={members.map((m) => m.profile).filter((p): p is NonNullable<typeof p> => !!p)}
      currentUserId={profile.id}
      canEdit={!!canEdit}
    />
  );
}
