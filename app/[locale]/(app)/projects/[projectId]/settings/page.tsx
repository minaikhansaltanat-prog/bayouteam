import { setRequestLocale } from "next-intl/server";
import { getAllTeamMembers, getProjectMembers } from "@/lib/data/projects";
import { getCurrentProfile } from "@/lib/actions/auth";
import { ProjectSettingsPanel } from "@/components/projects/project-settings-panel";
import { ROLE_ORDER } from "@/lib/types/database";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const [profile, members, allTeam] = await Promise.all([
    getCurrentProfile(),
    getProjectMembers(projectId),
    getAllTeamMembers(),
  ]);

  if (!profile) return null;

  const projectRole = members.find((m) => m.user_id === profile.id)?.role_in_project;
  const canEdit =
    ROLE_ORDER.indexOf(profile.role) <= ROLE_ORDER.indexOf("admin") ||
    (projectRole && ROLE_ORDER.indexOf(projectRole) <= ROLE_ORDER.indexOf("editor"));

  return (
    <ProjectSettingsPanel
      projectId={projectId}
      members={members}
      allTeam={allTeam}
      canEdit={!!canEdit}
    />
  );
}
