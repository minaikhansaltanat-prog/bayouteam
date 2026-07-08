"use server";

import { createClient } from "@/lib/supabase/server";
import { isDevPreview, MOCK_TASKS } from "@/lib/dev/mock-data";
import type { Task, TaskChainStep, TaskEvent } from "@/lib/types/database";

export interface TaskDetail {
  task: Task & {
    assignee?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  };
  events: (TaskEvent & {
    profile?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  })[];
  chain: (TaskChainStep & {
    profile?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  })[];
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail | null> {
  if (isDevPreview()) {
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (!task) return null;
    return { task, events: [], chain: [] };
  }

  const supabase = await createClient();
  const [{ data: task }, { data: events }, { data: chain }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)")
      .eq("id", taskId)
      .single(),
    supabase
      .from("task_events")
      .select("*, profile:profiles(id, full_name, avatar_url)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true }),
    supabase
      .from("task_chains")
      .select("*, profile:profiles(id, full_name, avatar_url)")
      .eq("task_id", taskId)
      .order("step_order", { ascending: true }),
  ]);

  if (!task) return null;

  return {
    task: task as TaskDetail["task"],
    events: (events ?? []) as TaskDetail["events"],
    chain: (chain ?? []) as TaskDetail["chain"],
  };
}
