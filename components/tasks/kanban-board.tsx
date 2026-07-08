"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import { isDevPreview } from "@/lib/dev/mock-data";
import { TASK_STATUSES, type Profile, type Task, type TaskStatus } from "@/lib/types/database";

type TaskWithRelations = Task & {
  assignee?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export function KanbanBoard({
  projectId,
  initialTasks,
  members,
  currentUserId,
  canEdit,
}: {
  projectId: string;
  initialTasks: TaskWithRelations[];
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  currentUserId: string;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const [tasks, setTasks] = useState(initialTasks);
  const [mineOnly, setMineOnly] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  useEffect(() => {
    if (isDevPreview()) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`kanban-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        () => {
          // A lightweight refetch keeps this simple and correct; the parent
          // Server Component route revalidates via router.refresh() on any
          // local mutation already, this covers changes from teammates.
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visibleTasks = useMemo(
    () =>
      mineOnly
        ? tasks.filter(
            (task) => task.assignee_id === currentUserId || task.helpers.includes(currentUserId),
          )
        : tasks,
    [tasks, mineOnly, currentUserId],
  );

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithRelations[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    for (const task of visibleTasks) grouped[task.status].push(task);
    return grouped;
  }, [visibleTasks]);

  function findTask(id: string) {
    return tasks.find((task) => task.id === id) ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(findTask(String(event.active.id)));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = findTask(String(active.id));
    if (!activeTask) return;

    const overId = String(over.id);
    const destStatus: TaskStatus = (TASK_STATUSES as string[]).includes(overId)
      ? (overId as TaskStatus)
      : (findTask(overId)?.status ?? activeTask.status);

    if (destStatus === activeTask.status) return;

    setTasks((prev) =>
      prev.map((task) => (task.id === activeTask.id ? { ...task, status: destStatus } : task)),
    );
    updateTaskStatus(activeTask.id, projectId, destStatus);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <Switch checked={mineOnly} onCheckedChange={setMineOnly} />
          {t("tasks.myTasksOnly")}
        </label>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columns[status]}
              onAddTask={() => setCreateStatus(status)}
              onTaskClick={(id) => setDetailTaskId(id)}
              canEdit={canEdit}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {createStatus && (
        <TaskFormDialog
          open={!!createStatus}
          onOpenChange={(open) => !open && setCreateStatus(null)}
          projectId={projectId}
          status={createStatus}
          members={members}
        />
      )}

      {detailTaskId && (
        <TaskDetailDialog
          taskId={detailTaskId}
          projectId={projectId}
          open={!!detailTaskId}
          onOpenChange={(open) => !open && setDetailTaskId(null)}
          members={members}
          currentUserId={currentUserId}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onTaskClick,
  canEdit,
}: {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onAddTask: () => void;
  onTaskClick: (id: string) => void;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = tasks.map((task) => task.id);

  return (
    <div className="flex w-[85vw] shrink-0 flex-col sm:w-72 lg:w-auto">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {t(`tasks.statuses.${status}`)}
          <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </h3>
        {canEdit && (
          <button
            type="button"
            onClick={onAddTask}
            aria-label={t("kanban.addTask")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-24 flex-1 flex-col gap-2.5 rounded-[var(--radius-lg)] p-2 transition-colors ${
            isOver ? "bg-navy-50" : "bg-surface-2/60"
          }`}
        >
          {tasks.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              {t("kanban.emptyColumn")}
            </p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
            ))
          )}
          {canEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddTask}
              className="justify-start text-muted-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("kanban.addTask")}
            </Button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task, onClick }: { task: TaskWithRelations; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} onClick={onClick} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}
