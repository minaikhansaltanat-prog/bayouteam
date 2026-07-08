import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NavList } from "./nav-list";
import type { Role } from "@/lib/types/database";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col bg-navy-900">
      <div className="flex h-20 shrink-0 items-center gap-2.5 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/logo-mark.svg"
            alt="BaYou team"
            width={34}
            height={34}
            className="shrink-0"
          />
          <div className="font-display text-lg font-semibold tracking-tight text-white">
            BaYou team
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 py-2">
        <NavList role={role} variant="sidebar" />
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-xs text-navy-200/70">
        © {new Date().getFullYear()} BaYou team
      </div>
    </aside>
  );
}
