import { setRequestLocale, getTranslations } from "next-intl/server";
import { FolderKanban } from "lucide-react";
import { getProjects } from "@/lib/data/projects";
import { getCurrentProfile } from "@/lib/actions/auth";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_ORDER } from "@/lib/types/database";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, profile, projects] = await Promise.all([
    getTranslations("projects"),
    getCurrentProfile(),
    getProjects(),
  ]);

  const canCreate = profile && ROLE_ORDER.indexOf(profile.role) <= ROLE_ORDER.indexOf("admin");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        {canCreate && <ProjectFormDialog />}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderKanban className="h-10 w-10 text-navy-300" strokeWidth={1.5} />
            <p className="text-base font-medium text-foreground">{t("noProjects")}</p>
            <p className="text-sm text-muted-foreground">{t("createFirst")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
