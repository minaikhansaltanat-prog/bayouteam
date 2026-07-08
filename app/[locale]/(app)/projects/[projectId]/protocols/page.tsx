import { setRequestLocale, getTranslations } from "next-intl/server";
import { getMeetings } from "@/lib/data/meetings";
import { getProjectMembers } from "@/lib/data/projects";
import { MeetingList } from "@/components/meetings/meeting-list";
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog";

export default async function ProjectProtocolsPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const [t, meetings, members] = await Promise.all([
    getTranslations("meetings"),
    getMeetings(projectId),
    getProjectMembers(projectId),
  ]);

  const memberProfiles = members.map((m) => m.profile).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("title")}</h2>
        <MeetingFormDialog projectId={projectId} members={memberProfiles} />
      </div>
      <MeetingList meetings={meetings} members={memberProfiles} />
    </div>
  );
}
