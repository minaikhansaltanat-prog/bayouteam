import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAstanaDate, formatAstanaTime, initials } from "@/lib/utils";
import type { AuditLogEntry, Profile } from "@/lib/types/database";

export async function AuditLogPanel({
  entries,
}: {
  entries: (AuditLogEntry & { profile?: Profile })[];
}) {
  const t = await getTranslations("admin");

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("auditEmpty")}</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
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
        </div>
      ))}
    </div>
  );
}
