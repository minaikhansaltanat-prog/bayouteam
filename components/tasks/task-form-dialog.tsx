"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberSelect } from "./member-select";
import { createTask } from "@/lib/actions/tasks";
import { useRouter } from "@/i18n/navigation";
import { TASK_PRIORITIES, type TaskStatus, type Profile } from "@/lib/types/database";

const COLOR_SWATCHES = ["#B23A3A", "#B8790C", "#1E7A4C", "#2A5FA8", "#6B4E0A", null];

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  status,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  status: TaskStatus | null;
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [helperIds, setHelperIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<(typeof TASK_PRIORITIES)[number]>("medium");
  const [color, setColor] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("18:00");
  const [tags, setTags] = useState("");
  const [bonusValue, setBonusValue] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setAssigneeId(null);
    setHelperIds([]);
    setPriority("medium");
    setColor(null);
    setDueDate("");
    setDueTime("18:00");
    setTags("");
    setBonusValue("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !status) return;
    setSubmitting(true);

    const due_at = dueDate ? new Date(`${dueDate}T${dueTime || "00:00"}:00+05:00`).toISOString() : null;

    const result = await createTask(projectId, {
      title: title.trim(),
      description: description.trim() || undefined,
      assignee_id: assigneeId,
      helpers: helperIds,
      status,
      priority,
      color,
      due_at,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      bonus_type: bonusValue ? "text" : null,
      bonus_value: bonusValue || null,
    });

    setSubmitting(false);
    if (!result.error) {
      reset();
      onOpenChange(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("tasks.newTask")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">{t("tasks.title")}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("tasks.titlePlaceholder")}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">{t("tasks.description")}</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("tasks.descriptionPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("tasks.assignee")}</Label>
              <MemberSelect members={members} value={assigneeId} onChange={setAssigneeId} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("tasks.priority")}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as never)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(`tasks.priorities.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("tasks.helpers")}</Label>
            <div className="flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-border p-2.5">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50"
                >
                  <Checkbox
                    checked={helperIds.includes(member.id)}
                    onCheckedChange={(checked) =>
                      setHelperIds((prev) =>
                        checked ? [...prev, member.id] : prev.filter((id) => id !== member.id),
                      )
                    }
                  />
                  {member.full_name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="due-date">{t("tasks.dueDate")}</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="due-time">{t("tasks.dueTime")}</Label>
              <Input
                id="due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={!dueDate}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("tasks.color")}</Label>
            <div className="flex items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch ?? "none"}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={swatch ?? "none"}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  style={{
                    backgroundColor: swatch ?? "transparent",
                    borderColor: color === swatch ? "#16244A" : "#E4E0D4",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tags">
                {t("tasks.tags")} <span className="text-muted-foreground">({t("common.optional")})</span>
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="маркетинг, ресепшн"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bonus">{t("tasks.bonus")}</Label>
              <Input
                id="bonus"
                value={bonusValue}
                onChange={(e) => setBonusValue(e.target.value)}
                placeholder={t("tasks.bonusPlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? t("common.saving") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
