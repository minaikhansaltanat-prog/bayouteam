"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberSelect } from "@/components/tasks/member-select";
import { createMeeting } from "@/lib/actions/meetings";
import { useRouter } from "@/i18n/navigation";
import type { Profile } from "@/lib/types/database";

export function MeetingFormDialog({
  projectId,
  members,
}: {
  projectId: string;
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [secretaryId, setSecretaryId] = useState<string | null>(null);
  const [agenda, setAgenda] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    const result = await createMeeting(projectId, {
      title: title.trim(),
      date: new Date(date).toISOString(),
      secretary_id: secretaryId,
      agenda: agenda.trim() || undefined,
      participants: members.map((m) => m.id),
    });
    setSubmitting(false);
    if (!result.error) {
      setOpen(false);
      setTitle("");
      setDate("");
      setAgenda("");
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          {t("meetings.newMeeting")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("meetings.newMeeting")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-title">{t("meetings.meetingTitle")}</Label>
            <Input id="meeting-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meeting-date">{t("meetings.date")}</Label>
              <Input
                id="meeting-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("meetings.secretary")}</Label>
              <MemberSelect members={members} value={secretaryId} onChange={setSecretaryId} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-agenda">{t("meetings.agenda")}</Label>
            <Textarea
              id="meeting-agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder={t("meetings.agendaPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
