"use client";

import { useTranslations } from "next-intl";
import { FileText, Download, Lock } from "lucide-react";
import { getSignedFileUrl } from "@/lib/actions/files";
import { formatAstanaDate } from "@/lib/utils";
import type { FileRecord } from "@/lib/types/database";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileList({
  files,
}: {
  files: (FileRecord & { uploader?: { full_name: string | null } | null })[];
}) {
  const t = useTranslations("files");

  async function handleDownload(fileId: string) {
    const result = await getSignedFileUrl(fileId);
    if (result.data) window.open(result.data, "_blank");
  }

  if (files.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("title")}: 0</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-navy-50 text-navy-700">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)} · {file.uploader?.full_name ?? "—"} ·{" "}
              {formatAstanaDate(file.created_at, true)}
            </p>
          </div>
          {file.is_contract && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <button
            type="button"
            onClick={() => handleDownload(file.id)}
            aria-label={t("download")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
