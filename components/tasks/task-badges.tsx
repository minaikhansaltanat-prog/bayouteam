import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/types/database";

const PRIORITY_VARIANT: Record<TaskPriority, "neutral" | "info" | "warning" | "danger"> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

const STATUS_VARIANT: Record<TaskStatus, "neutral" | "info" | "warning" | "success"> = {
  todo: "neutral",
  in_progress: "info",
  in_review: "warning",
  done: "success",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const t = useTranslations("tasks.priorities");
  return <Badge variant={PRIORITY_VARIANT[priority]}>{t(priority)}</Badge>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("tasks.statuses");
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
