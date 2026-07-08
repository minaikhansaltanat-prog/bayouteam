"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MeetingDecision } from "@/lib/types/database";

export interface MeetingFormInput {
  title: string;
  date: string;
  secretary_id?: string | null;
  agenda?: string;
  participants?: string[];
}

export async function createMeeting(projectId: string, input: MeetingFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data, error } = await supabase
    .from("meetings")
    .insert({ ...input, project_id: projectId, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/meetings");
  return { data };
}

export async function addMeetingDecision(
  meetingId: string,
  decision: Omit<MeetingDecision, "id" | "task_id">,
) {
  const supabase = await createClient();
  const { data: meeting, error: fetchError } = await supabase
    .from("meetings")
    .select("decisions")
    .eq("id", meetingId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const decisions: MeetingDecision[] = [
    ...((meeting?.decisions as MeetingDecision[]) ?? []),
    { ...decision, id: crypto.randomUUID(), task_id: null },
  ];

  const { error } = await supabase
    .from("meetings")
    .update({ decisions })
    .eq("id", meetingId);
  if (error) return { error: error.message };
  revalidatePath("/meetings");
  return { data: true };
}

export async function convertDecisionToTask(
  meetingId: string,
  projectId: string,
  decisionId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data: meeting, error: fetchError } = await supabase
    .from("meetings")
    .select("decisions, title")
    .eq("id", meetingId)
    .single();
  if (fetchError || !meeting) return { error: fetchError?.message ?? "not_found" };

  const decisions = meeting.decisions as MeetingDecision[];
  const decision = decisions.find((d) => d.id === decisionId);
  if (!decision) return { error: "decision_not_found" };

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: decision.text,
      description: `«${meeting.title}» жиналысының шешімі`,
      assignee_id: decision.assignee_id,
      due_at: decision.due_at,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (taskError) return { error: taskError.message };

  const updatedDecisions = decisions.map((d) =>
    d.id === decisionId ? { ...d, task_id: task.id } : d,
  );
  await supabase.from("meetings").update({ decisions: updatedDecisions }).eq("id", meetingId);

  revalidatePath("/meetings");
  revalidatePath(`/projects/${projectId}`);
  return { data: task };
}
