"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, ClipboardList, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberSelect } from "@/components/tasks/member-select";
import { addMeetingDecision, convertDecisionToTask } from "@/lib/actions/meetings";
import { useRouter } from "@/i18n/navigation";
import { formatAstanaDate, formatAstanaTime } from "@/lib/utils";
import type { Meeting, MeetingDecision, Profile } from "@/lib/types/database";

export function MeetingDetailDialog({
  meeting,
  members,
  open,
  onOpenChange,
}: {
  meeting: (Meeting & { project?: { id: string; name: string } | null }) | null;
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [decisionText, setDecisionText] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (!meeting) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl" />
      </Dialog>
    );
  }

  // Closures below don't retain control-flow narrowing on `meeting` itself,
  // so bind it to a new, permanently non-null const first.
  const currentMeeting = meeting;

  async function handleAddDecision() {
    if (!decisionText.trim()) return;
    setAdding(true);
    await addMeetingDecision(currentMeeting.id, {
      text: decisionText.trim(),
      assignee_id: assigneeId,
      due_at: null,
    });
    setDecisionText("");
    setAssigneeId(null);
    setAdding(false);
    router.refresh();
  }

  async function handleConvert(decisionId: string) {
    if (!currentMeeting.project?.id) return;
    await convertDecisionToTask(currentMeeting.id, currentMeeting.project.id, decisionId);
    router.refresh();
  }

  const decisions = meeting.decisions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{meeting.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            {formatAstanaDate(meeting.date, true)} · {formatAstanaTime(meeting.date)}
          </p>

          {meeting.agenda && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground">{t("meetings.agenda")}</h4>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{meeting.agenda}</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ClipboardList className="h-4 w-4" /> {t("meetings.decisions")}
            </h4>

            {decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("meetings.noDecisions")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {decisions.map((decision: MeetingDecision) => (
                  <li
                    key={decision.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-foreground">{decision.text}</span>
                    {decision.task_id ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("meetings.taskCreated")}
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleConvert(decision.id)}>
                        {t("meetings.convertToTask")}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-dashed border-border p-3 sm:flex-row sm:items-center">
              <Input
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                placeholder={t("meetings.decisionText")}
                className="flex-1"
              />
              <div className="sm:w-44">
                <MemberSelect
                  members={members}
                  value={assigneeId}
                  onChange={setAssigneeId}
                  placeholder={t("tasks.assignee")}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddDecision}
                disabled={adding || !decisionText.trim()}
              >
                <Plus className="h-4 w-4" />
                {t("meetings.addDecision")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
