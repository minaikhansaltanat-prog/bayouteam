import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/actions/auth";
import { getAllMembers, getAuditLog } from "@/lib/data/admin";
import { MembersPanel } from "@/components/admin/members-panel";
import { PermissionsMatrix } from "@/components/admin/permissions-matrix";
import { AuditLogPanel } from "@/components/admin/audit-log-panel";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_ORDER } from "@/lib/types/database";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, profile] = await Promise.all([getTranslations("admin"), getCurrentProfile()]);

  if (!profile || ROLE_ORDER.indexOf(profile.role) > ROLE_ORDER.indexOf("admin")) {
    redirect({ href: "/dashboard", locale });
  }

  const [members, auditLog] = await Promise.all([getAllMembers(), getAuditLog()]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {t("title")}
      </h1>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">{t("membersTab")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("permissionsTab")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("analyticsTab")}</TabsTrigger>
          <TabsTrigger value="audit">{t("auditTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersPanel members={members} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsMatrix />
        </TabsContent>
        <TabsContent value="analytics">
          <ComingSoon />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogPanel entries={auditLog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
