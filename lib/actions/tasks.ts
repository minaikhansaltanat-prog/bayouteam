"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  BonusType,
  ChecklistItem,
  PlanScope,
  TaskPriority,
  TaskStatus,
} from "@/lib/types/database";

export interface TaskFormInput {
  title: string;
  description?: string;
  assignee_id?: string | null;
  helpers?: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  color?: string | null;
  plan_scope?: PlanScope;
  due_at?: string | null;
  bonus_type?: BonusType | null;
  bonus_value?: string | null;
  tags?: string[];
}

export async function createTask(projectId: string, input: TaskFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, project_id: projectId, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data };
}

export async function updateTask(
  taskId: string,
  projectId: string,
  input: Partial<TaskFormInput>,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update(input).eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function updateTaskStatus(
  taskId: string,
  projectId: string,
  status: TaskStatus,
  position?: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload: Record<string, unknown> = { status };
  if (typeof position === "number") payload.position = position;

  const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
  if (error) return { error: error.message };

  await supabase.from("task_events").insert({
    task_id: taskId,
    user_id: user?.id,
    event_type: "status_change",
    payload: { status },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { data: true };
}

export async function softDeleteTask(taskId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function updateChecklist(
  taskId: string,
  projectId: string,
  checklist: ChecklistItem[],
) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ checklist }).eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function addComment(taskId: string, projectId: string, text: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("task_events").insert({
    task_id: taskId,
    user_id: user.id,
    event_type: "comment",
    payload: { text },
  });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export interface ChainStepInput {
  user_id: string;
  description?: string;
  step_deadline?: string | null;
}

export async function setTaskChain(
  taskId: string,
  projectId: string,
  steps: ChainStepInput[],
) {
  const supabase = await createClient();

  await supabase.from("task_chains").delete().eq("task_id", taskId);

  if (steps.length === 0) return { data: true };

  const rows = steps.map((step, index) => ({
    task_id: taskId,
    step_order: index + 1,
    user_id: step.user_id,
    description: step.description ?? null,
    step_deadline: step.step_deadline ?? null,
    status: index === 0 ? ("active" as const) : ("pending" as const),
  }));

  const { error } = await supabase.from("task_chains").insert(rows);
  if (error) return { error: error.message };

  await supabase
    .from("tasks")
    .update({ assignee_id: steps[0].user_id })
    .eq("id", taskId);

  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function completeChainStep(chainStepId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_chains")
    .update({ status: "done" })
    .eq("id", chainStepId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { data: true };
}

export async function returnChainStep(
  chainStepId: string,
  projectId: string,
  reason: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_chains")
    .update({ status: "returned", returned_reason: reason })
    .eq("id", chainStepId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { data: true };
}
