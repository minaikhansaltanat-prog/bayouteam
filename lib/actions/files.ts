"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { FileScope } from "@/lib/types/database";

export interface FileRecordInput {
  scope: FileScope;
  scope_id?: string | null;
  name: string;
  storage_path: string;
  mime?: string;
  size: number;
  is_contract?: boolean;
}

export async function recordUploadedFile(input: FileRecordInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data, error } = await supabase
    .from("files")
    .insert({ ...input, owner_id: user.id })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/projects");
  return { data };
}

// Reads always go through this action: the RLS-protected `files` row is
// fetched first (so a user with no access gets nothing back), then a
// short-lived signed URL is minted with the service-role key.
export async function getSignedFileUrl(fileId: string) {
  const supabase = await createClient();
  const { data: file, error } = await supabase
    .from("files")
    .select("storage_path")
    .eq("id", fileId)
    .single();
  if (error || !file) return { error: "no_access" };

  const service = createServiceClient();
  const { data, error: signError } = await service.storage
    .from("attachments")
    .createSignedUrl(file.storage_path, 60 * 10);
  if (signError) return { error: signError.message };

  return { data: data.signedUrl };
}

export async function deleteFile(fileId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("attachments").remove([storagePath]);
  const { error } = await supabase.from("files").delete().eq("id", fileId);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { data: true };
}

export async function grantFilePermission(
  fileId: string,
  userId: string,
  canView: boolean,
  canDownload: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("file_permissions").upsert(
    {
      file_id: fileId,
      user_id: userId,
      can_view: canView,
      can_download: canDownload,
      granted_by: user?.id,
    },
    { onConflict: "file_id,user_id" },
  );
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { data: true };
}
