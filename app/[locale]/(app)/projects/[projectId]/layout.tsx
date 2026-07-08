import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProjectById, getProjectTasks } from "@/lib/data/projects";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { Badge } from "@/components/ui/badge";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const [t, project, tasks] = await Promise.all([
    getTranslations("projects"),
    getProjectById(projectId),
    getProjectTasks(projectId),
  ]);

  if (!project) notFound();

  const doneCount = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-navy-100 shadow-soft">
          {project.logo_url ? (
            <Image src={project.logo_url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-xl font-semibold text-navy-400">
              {project.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
              {project.name}
            </h1>
            <Badge
              variant={
                project.status === "active"
                  ? "success"
                  : project.status === "on_hold"
                    ? "warning"
                    : "neutral"
              }
            >
              {t(`status.${project.status === "on_hold" ? "onHold" : project.status}`)}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {t("progress")} {progress}%
            </span>
          </div>
        </div>
      </div>

      <ProjectTabs projectId={projectId} />

      <div>{children}</div>
    </div>
  );
}
