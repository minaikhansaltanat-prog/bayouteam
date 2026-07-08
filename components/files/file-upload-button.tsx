"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { recordUploadedFile } from "@/lib/actions/files";
import { useRouter } from "@/i18n/navigation";
import type { FileScope } from "@/lib/types/database";

const MAX_SIZE = 200 * 1024 * 1024;

export function FileUploadButton({
  scope,
  scopeId,
}: {
  scope: FileScope;
  scopeId: string | null;
}) {
  const t = useTranslations();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE) {
      alert(t("files.sizeLimitNote"));
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `${scope}/${scopeId ?? "workspace"}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file);

    if (!uploadError) {
      await recordUploadedFile({
        scope,
        scope_id: scopeId,
        name: file.name,
        storage_path: path,
        mime: file.type,
        size: file.size,
      });
      router.refresh();
    }

    setUploading(false);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {t("projects.uploadFile")}
      </Button>
    </>
  );
}
