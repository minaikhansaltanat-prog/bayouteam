"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { deleteAuditLogEntries } from "@/lib/actions/audit";
import { useRouter } from "@/i18n/navigation";
import { formatAstanaDate, formatAstanaTime, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AuditLogEntry, Profile } from "@/lib/types/database";

export function AuditLogPanel({
  entries,
}: {
  entries: (AuditLogEntry & { profile?: Profile })[];
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = entries.length > 0 && selected.size === entries.length;
  const someSelected = selected.size > 0;

  const orderedIds = useMemo(() => entries.map((e) => e.id), [entries]);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orderedIds));
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(t("deleteSelectedConfirm", { count: selected.size }));
    if (!confirmed) return;
    setDeleting(true);
    await deleteAuditLogEntries(Array.from(selected));
    setSelected(new Set());
    setDeleting(false);
    router.refresh();
  }

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("auditEmpty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[var(--radius-md)] bg-surface-2 px-3.5 py-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
          />
          {t("selectAll")}
          {someSelected && (
            <span className="text-muted-foreground">— {t("selectedCount", { count: selected.size })}</span>
          )}
        </label>
        <Button
          size="sm"
          variant="danger"
          disabled={!someSelected || deleting}
          onClick={handleDeleteSelected}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("deleteSelected")}
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
        {entries.map((entry) => (
          <label
            key={entry.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2",
              selected.has(entry.id) && "bg-navy-50",
            )}
          >
            <Checkbox
              checked={selected.has(entry.id)}
              onCheckedChange={() => toggleOne(entry.id)}
            />
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={entry.profile?.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="text-[10px]">
                {initials(entry.profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="font-medium">{entry.profile?.full_name ?? "—"}</span>{" "}
                <span className="text-muted-foreground">{entry.action}</span>{" "}
                <span className="text-muted-foreground">{entry.resource}</span>
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatAstanaDate(entry.created_at, true)} {formatAstanaTime(entry.created_at)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
