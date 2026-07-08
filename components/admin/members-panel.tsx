"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, CheckCircle2, Mail, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  changeUserRole,
  inviteMember,
  setErrorLimit,
  setUserBlocked,
} from "@/lib/actions/roles";
import { useRouter } from "@/i18n/navigation";
import { initials } from "@/lib/utils";
import type { Role } from "@/lib/types/database";
import type { MemberWithLimit } from "@/lib/data/admin";

const ASSIGNABLE_ROLES: Role[] = ["admin", "editor", "member", "guest"];

export function MembersPanel({ members }: { members: MemberWithLimit[] }) {
  const t = useTranslations();
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviting, setInviting] = useState(false);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await inviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    setInviting(false);
    router.refresh();
  }

  async function handleRoleChange(userId: string, role: Role) {
    await changeUserRole(userId, role);
    router.refresh();
  }

  async function handleBlockToggle(userId: string, blocked: boolean) {
    await setUserBlocked(userId, blocked);
    router.refresh();
  }

  async function handleLimitChange(userId: string, value: string) {
    const limit = value === "" ? null : Number(value);
    await setErrorLimit(userId, limit);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-dashed border-border p-4 sm:flex-row sm:items-center">
        <Mail className="hidden h-4 w-4 text-muted-foreground sm:block" />
        <Input
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder={t("admin.inviteEmailPlaceholder")}
          type="email"
          className="flex-1"
        />
        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`roles.${role}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
          <Plus className="h-4 w-4" />
          {t("admin.sendInvite")}
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{initials(member.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {member.full_name}
                  </span>
                  {member.is_blocked && <Badge variant="danger">blocked</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{member.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{t("admin.errorLimit")}:</span>
                <Input
                  type="number"
                  min={0}
                  defaultValue={member.error_limit ?? ""}
                  onBlur={(e) => handleLimitChange(member.id, e.target.value)}
                  className="h-9 w-16 px-2 text-center"
                />
                <span className="text-xs text-muted-foreground">
                  ({member.error_count ?? 0})
                </span>
              </div>

              {member.role === "owner" ? (
                <Badge variant="gold">{t("roles.owner")}</Badge>
              ) : (
                <Select
                  value={member.role}
                  onValueChange={(v) => handleRoleChange(member.id, v as Role)}
                >
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {member.role !== "owner" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBlockToggle(member.id, !member.is_blocked)}
                >
                  {member.is_blocked ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Ban className="h-3.5 w-3.5" />
                  )}
                  {member.is_blocked ? t("admin.unblockUser") : t("admin.blockUser")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
