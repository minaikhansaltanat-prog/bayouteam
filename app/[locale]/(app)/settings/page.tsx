import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { ProfileForm } from "@/components/settings/profile-form";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ComingSoon } from "@/components/ui/coming-soon";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, profile] = await Promise.all([getTranslations("settings"), getCurrentProfile()]);
  if (!profile) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {t("title")}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("avatar")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            userId={profile.id}
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profileTab")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocaleSwitcher />
        </CardContent>
      </Card>

      <ComingSoon title={`${t("myContract")} · ${t("myBonuses")} · ${t("myPerformance")}`} />
    </div>
  );
}
