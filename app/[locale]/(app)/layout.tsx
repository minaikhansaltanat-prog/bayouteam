import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (profile.is_blocked) {
    redirect({ href: "/login?blocked=1", locale });
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <Sidebar role={profile.role} />
      <div className="flex min-h-[100dvh] flex-col md:pl-64">
        <Topbar profile={profile} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
