import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ui/coming-soon";

export default async function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon />;
}
