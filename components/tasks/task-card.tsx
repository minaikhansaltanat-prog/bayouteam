"use client";

import { useTranslations } from "next-intl";
import { CalendarClock, CheckSquare, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/tasks/task-badges";
import { cn, initials, formatAstanaDate } from "@/lib/utils";
import type { Task } from "@/lib/types/database";

interface TaskCardProps {
  task: Task & {
    project?: { id: string; name: string; logo_url: string | null } | null;
    assignee?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  };
  onClick?: () => void;
  showProject?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function TaskCard({ task, onClick, showProject, dragHandleProps }: TaskCardProps) {
  const t = useTranslations("tasks");

  const checklist = task.checklist ?? [];
  const checklistDone = checklist.filter((c) => c.done).length;
  const dueDate = task.due_at ? new Date(task.due_at) : null;
  const isOverdue = dueDate ? dueDate.getTime() < Date.now() && task.status !== "done" : false;
  const helperCount = task.helpers?.length ?? 0;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      {...dragHandleProps}
      className={cn(
        "group flex cursor-pointer flex-col gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500",
      )}
      style={task.color ? { borderLeftColor: task.color, borderLeftWidth: 3 } : undefined}
    >
      {showProject && task.project && (
        <span className="w-fit rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-700">
          {task.project.name}
        </span>
      )}

      <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {task.title}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {dueDate && (
            <span
              className={cn(
                "flex items-center gap-1",
                isOverdue && "font-semibold text-danger",
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {formatAstanaDate(dueDate)}
            </span>
          )}
          {checklist.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {checklistDone}/{checklist.length}
            </span>
          )}
          {helperCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {helperCount}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-[10px]">
              {initials(task.assignee.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {task.bonus_value && (
        <div className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-gold-50 px-2 py-1 text-[11px] font-medium text-gold-800">
          {t("bonus")}: {task.bonus_value}
        </div>
      )}
    </div>
  );
}
