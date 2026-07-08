"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, canSeeNavItem } from "./nav-config";
import type { Role } from "@/lib/types/database";

export function NavList({
  role,
  onNavigate,
  variant = "sidebar",
}: {
  role: Role;
  onNavigate?: () => void;
  variant?: "sidebar" | "sheet";
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label={t("dashboard")}>
      {NAV_ITEMS.filter((item) => canSeeNavItem(item, role)).map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500",
              variant === "sheet" && "min-h-[44px] px-4 py-3.5 text-base",
              isActive
                ? "bg-navy-800 text-white shadow-soft"
                : "text-navy-100/90 hover:bg-white/10",
              variant === "sheet" &&
                (isActive
                  ? "bg-navy-800 text-white"
                  : "text-foreground hover:bg-surface-2"),
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                isActive
                  ? variant === "sheet"
                    ? "text-white"
                    : "text-gold-400"
                  : "opacity-80 group-hover:opacity-100",
              )}
              strokeWidth={2}
            />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
