"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CalendarClock, Link2, Send, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges";
import { getTaskDetail, type TaskDetail } from "@/lib/actions/task-detail";
import {
  addComment,
  completeChainStep,
  returnChainStep,
  updateChecklist,
  updateTaskStatus,
} from "@/lib/actions/tasks";
import { useRouter } from "@/i18n/navigation";
import { formatAstanaDate, formatAstanaTime, initials } from "@/lib/utils";
import { TASK_STATUSES, type Profile, type TaskStatus } from "@/lib/types/database";

export function TaskDetailDialog({
  taskId,
  projectId,
  open,
  onOpenChange,
  members,
  currentUserId,
  canEdit,
}: {
  taskId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  currentUserId: string;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [returningStepId, setReturningStepId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getTaskDetail(taskId).then((data) => {
      setDetail(data);
      setLoading(false);
    });
  }, [open, taskId]);

  function refresh() {
    getTaskDetail(taskId).then(setDetail);
    router.refresh();
  }

  async function handleStatusChange(status: TaskStatus) {
    await updateTaskStatus(taskId, projectId, status);
    refresh();
  }

  async function handleChecklistToggle(itemId: string) {
    if (!detail) return;
    const checklist = detail.task.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    setDetail({ ...detail, task: { ...detail.task, checklist } });
    await updateChecklist(taskId, projectId, checklist);
    router.refresh();
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment("");
    startTransition(async () => {
      await addComment(taskId, projectId, text);
      refresh();
    });
  }

  async function handleCompleteStep(stepId: string) {
    await completeChainStep(stepId, projectId);
    refresh();
  }

  async function handleReturnStep(stepId: string) {
    if (!returnReason.trim()) return;
    await returnChainStep(stepId, projectId, returnReason.trim());
    setReturningStepId(null);
    setReturnReason("");
    refresh();
  }

  const task = detail?.task;
  const isAssigneeOrHelper =
    task && (task.assignee_id === currentUserId || task.helpers.includes(currentUserId));
  const canChangeStatus = canEdit || isAssigneeOrHelper;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {loading || !task ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <DialogTitle className="mt-1">{task.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              {task.description && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {task.description}
                </p>
              )}

              {canChangeStatus && (
                <div className="flex flex-wrap gap-2">
                  {TASK_STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === task.status ? "primary" : "outline"}
                      onClick={() => handleStatusChange(status)}
                    >
                      {t(`tasks.statuses.${status}`)}
                    </Button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 rounded-[var(--radius-lg)] bg-surface-2 p-4 sm:grid-cols-3">
                <MetaField label={t("tasks.assignee")}>
                  {task.assignee ? (
                    <span className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={task.assignee.avatar_url ?? undefined} alt="" />
                        <AvatarFallback className="text-[9px]">
                          {initials(task.assignee.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee.full_name}
                    </span>
                  ) : (
                    "—"
                  )}
                </MetaField>
                <MetaField label={t("tasks.deadline")}>
                  {task.due_at ? (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatAstanaDate(task.due_at, true)} · {formatAstanaTime(task.due_at)}
                    </span>
                  ) : (
                    t("tasks.noDeadline")
                  )}
                </MetaField>
                <MetaField label={t("tasks.bonus")}>
                  {task.bonus_value || "—"}
                </MetaField>
              </div>

              {task.checklist.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{t("tasks.checklist")}</h4>
                  <div className="flex flex-col gap-1.5">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-surface-2"
                      >
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={() => handleChecklistToggle(item.id)}
                        />
                        <span
                          className={
                            item.done
                              ? "text-sm text-muted-foreground line-through"
                              : "text-sm text-foreground"
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {detail && detail.chain.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Link2 className="h-4 w-4" /> {t("tasks.chain")}
                  </h4>
                  <ol className="flex flex-col gap-2">
                    {detail.chain.map((step) => (
                      <li
                        key={step.id}
                        className={`flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-sm ${
                          step.status === "active"
                            ? "border-navy-300 bg-navy-50"
                            : step.status === "done"
                              ? "border-success/30 bg-success-bg"
                              : "border-border bg-surface"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-[10px] font-semibold text-white">
                            {step.step_order}
                          </span>
                          {step.profile?.full_name}
                        </span>
                        {step.status === "active" && step.user_id === currentUserId && (
                          <span className="flex gap-1.5">
                            <Button size="sm" onClick={() => handleCompleteStep(step.id)}>
                              {t("tasks.markDone")}
                            </Button>
                            {step.step_order > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReturningStepId(step.id)}
                              >
                                <Undo2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                  {returningStepId && (
                    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border p-3">
                      <Textarea
                        placeholder={t("tasks.returnPlaceholder")}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setReturningStepId(null)}>
                          {t("common.cancel")}
                        </Button>
                        <Button size="sm" onClick={() => handleReturnStep(returningStepId)}>
                          {t("tasks.return")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground">{t("tasks.comments")}</h4>
                <div className="flex flex-col gap-3">
                  {detail?.events
                    .filter((event) => event.event_type === "comment")
                    .map((event) => (
                      <div key={event.id} className="flex items-start gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={event.profile?.avatar_url ?? undefined} alt="" />
                          <AvatarFallback className="text-[10px]">
                            {initials(event.profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-[var(--radius-md)] bg-surface-2 px-3 py-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {event.profile?.full_name}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            {String(event.payload?.text ?? "")}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder={t("tasks.addComment")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-11 flex-1"
                    rows={1}
                  />
                  <Button size="icon" onClick={handleAddComment} aria-label={t("tasks.addComment")}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}
