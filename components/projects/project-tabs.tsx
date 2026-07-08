"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const t = useTranslations("projects.tabs");
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const tabs = [
    { href: base, key: "board" },
    { href: `${base}/list`, key: "list" },
    { href: `${base}/files`, key: "files" },
    { href: `${base}/protocols`, key: "protocols" },
    { href: `${base}/analytics`, key: "analytics" },
    { href: `${base}/settings`, key: "settings" },
  ] as const;

  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-3.5 py-3 text-sm font-medium transition-colors",
              isActive ? "text-navy-800" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.key)}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
