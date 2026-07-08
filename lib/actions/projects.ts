"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProjectFormInput {
  name: string;
  description?: string;
  website?: string;
  goal?: string;
  deadline?: string;
  logo_url?: string;
}

export async function createProject(input: ProjectFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("project_members")
    .insert({ project_id: data.id, user_id: user.id, role_in_project: "owner" });

  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "project.create",
    resource: `project:${data.id}`,
    details: { name: input.name },
  });

  revalidatePath("/projects");
  return { data };
}

export async function updateProject(projectId: string, input: Partial<ProjectFormInput>) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(input).eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { data: true };
}

export async function setProjectStatus(
  projectId: string,
  status: "active" | "on_hold" | "completed",
) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function archiveProject(projectId: string, archived: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { data: true };
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  roleInProject: string = "member",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: userId, role_in_project: roleInProject });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}

export async function changeProjectMemberRole(
  projectId: string,
  userId: string,
  roleInProject: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .update({ role_in_project: roleInProject })
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { data: true };
}
