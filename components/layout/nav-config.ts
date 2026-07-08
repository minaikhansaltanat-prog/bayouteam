import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, FolderKanban, Users, Settings, ShieldCheck } from "lucide-react";
import { ROLE_ORDER, type Role } from "@/lib/types/database";

export interface NavItem {
  href: string;
  labelKey: "dashboard" | "projects" | "meetings" | "settings" | "admin";
  icon: LucideIcon;
  minRole?: Role;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/meetings", labelKey: "meetings", icon: Users },
  { href: "/settings", labelKey: "settings", icon: Settings },
  { href: "/admin", labelKey: "admin", icon: ShieldCheck, minRole: "admin" },
];

export function canSeeNavItem(item: NavItem, role: Role) {
  if (!item.minRole) return true;
  return ROLE_ORDER.indexOf(role) <= ROLE_ORDER.indexOf(item.minRole);
}
