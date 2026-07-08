import { setRequestLocale, getTranslations } from "next-intl/server";
import { getMeetings } from "@/lib/data/meetings";
import { getAllTeamMembers } from "@/lib/data/projects";
import { MeetingList } from "@/components/meetings/meeting-list";

export default async function MeetingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, meetings, members] = await Promise.all([
    getTranslations("meetings"),
    getMeetings(),
    getAllTeamMembers(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <MeetingList meetings={meetings} members={members} showProject />
    </div>
  );
}
