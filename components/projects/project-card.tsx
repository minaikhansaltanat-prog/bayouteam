import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatAstanaDate } from "@/lib/utils";
import type { Project } from "@/lib/types/database";

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("projects");

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
    >
      <div className="relative h-32 w-full overflow-hidden bg-navy-100">
        {project.logo_url ? (
          <Image
            src={project.logo_url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl font-semibold text-navy-300">
            {project.name.slice(0, 1)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/0 to-navy-950/0 mix-blend-multiply" />
        <Badge
          variant={
            project.status === "active"
              ? "success"
              : project.status === "on_hold"
                ? "warning"
                : "neutral"
          }
          className="absolute right-3 top-3"
        >
          {t(`status.${project.status === "on_hold" ? "onHold" : project.status}`)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
          {project.name}
        </h3>
        {project.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}
        {project.deadline && (
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatAstanaDate(project.deadline, true)}
          </div>
        )}
      </div>
    </Link>
  );
}
