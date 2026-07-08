"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Users2 } from "lucide-react";
import { MeetingDetailDialog } from "./meeting-detail-dialog";
import { formatAstanaDate, formatAstanaTime } from "@/lib/utils";
import type { Meeting, Profile } from "@/lib/types/database";

type MeetingWithProject = Meeting & {
  project?: { id: string; name: string } | null;
  secretary?: { id: string; full_name: string | null } | null;
};

export function MeetingList({
  meetings,
  members,
  showProject,
}: {
  meetings: MeetingWithProject[];
  members: Pick<Profile, "id" | "full_name" | "avatar_url">[];
  showProject?: boolean;
}) {
  const t = useTranslations("meetings");
  const [openMeeting, setOpenMeeting] = useState<MeetingWithProject | null>(null);

  if (meetings.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("noMeetings")}</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {meetings.map((meeting) => (
        <button
          key={meeting.id}
          type="button"
          onClick={() => setOpenMeeting(meeting)}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
        >
          <div className="min-w-0 flex-1">
            {showProject && meeting.project && (
              <span className="text-xs font-medium text-navy-600">{meeting.project.name}</span>
            )}
            <p className="truncate font-display text-base font-semibold text-foreground">
              {meeting.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatAstanaDate(meeting.date, true)} · {formatAstanaTime(meeting.date)}
              </span>
              {meeting.secretary && (
                <span className="flex items-center gap-1">
                  <Users2 className="h-3.5 w-3.5" />
                  {meeting.secretary.full_name}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
            {(meeting.decisions ?? []).length} {t("decisions").toLowerCase()}
          </span>
        </button>
      ))}

      {openMeeting && (
        <MeetingDetailDialog
          meeting={openMeeting}
          members={members}
          open={!!openMeeting}
          onOpenChange={(open) => !open && setOpenMeeting(null)}
        />
      )}
    </div>
  );
}
