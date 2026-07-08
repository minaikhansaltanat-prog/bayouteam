"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";
import { TASK_STATUSES, type Profile, type Task } from "@/lib/types/database";

type TaskWithRelations = Task & {
  assignee?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export function TaskListView({
  projectId,
  tasks,
  members,
  currentUserId,
  canEdit,
}: {
  projectId: string;
  tasks: TaskWithRelations[];
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  currentUserId: string;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const [mineOnly, setMineOnly] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const visibleTasks = useMemo(
    () =>
      mineOnly
        ? tasks.filter(
            (task) => task.assignee_id === currentUserId || task.helpers.includes(currentUserId),
          )
        : tasks,
    [tasks, mineOnly, currentUserId],
  );

  return (
    <div className="flex flex-col gap-5">
      <label className="flex w-fit items-center gap-2.5 text-sm font-medium text-foreground">
        <Switch checked={mineOnly} onCheckedChange={setMineOnly} />
        {t("tasks.myTasksOnly")}
      </label>

      {TASK_STATUSES.map((status) => {
        const group = visibleTasks.filter((task) => task.status === status);
        if (group.length === 0) return null;
        return (
          <section key={status} className="flex flex-col gap-2.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {t(`tasks.statuses.${status}`)}
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {group.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => {
                    setDetailTaskId(task.id);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}

      {visibleTasks.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("tasks.noTasksFiltered")}
        </p>
      )}

      <TaskDetailDialog
        taskId={detailTaskId}
        projectId={projectId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        members={members}
        currentUserId={currentUserId}
        canEdit={canEdit}
      />
    </div>
  );
}
