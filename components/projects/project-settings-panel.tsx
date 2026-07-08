"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberSelect } from "@/components/tasks/member-select";
import {
  addProjectMember,
  archiveProject,
  removeProjectMember,
} from "@/lib/actions/projects";
import { useRouter } from "@/i18n/navigation";
import { initials } from "@/lib/utils";
import type { Profile, ProjectMember } from "@/lib/types/database";

export function ProjectSettingsPanel({
  projectId,
  members,
  allTeam,
  canEdit,
}: {
  projectId: string;
  members: ProjectMember[];
  allTeam: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  canEdit: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [newMemberId, setNewMemberId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nonMembers = allTeam.filter((m) => !members.some((pm) => pm.user_id === m.id));

  async function handleAdd() {
    if (!newMemberId) return;
    setBusy(true);
    await addProjectMember(projectId, newMemberId);
    setNewMemberId(null);
    setBusy(false);
    router.refresh();
  }

  async function handleRemove(userId: string) {
    await removeProjectMember(projectId, userId);
    router.refresh();
  }

  async function handleArchive() {
    await archiveProject(projectId, true);
    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{t("projects.members")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.profile?.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-xs">
                    {initials(member.profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {member.profile?.full_name}
                </span>
                <Badge variant="navy">{t(`roles.${member.role_in_project}`)}</Badge>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.user_id)}
                  aria-label={t("common.remove")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger-bg hover:text-danger cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {canEdit && nonMembers.length > 0 && (
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <div className="flex-1">
                <MemberSelect members={nonMembers} value={newMemberId} onChange={setNewMemberId} />
              </div>
              <Button size="sm" disabled={!newMemberId || busy} onClick={handleAdd}>
                {t("projects.addMember")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-danger">{t("projects.archive")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="danger" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
              {t("projects.archive")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
