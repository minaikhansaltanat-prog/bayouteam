import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MobileNav } from "./mobile-nav";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { NotificationsBell } from "./notifications-bell";
import type { Profile } from "@/lib/types/database";

export async function Topbar({ profile }: { profile: Profile }) {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <Image src="/logo-mark.svg" alt="BaYou team" width={30} height={30} />
        <span className="font-display text-base font-semibold text-foreground">
          BaYou team
        </span>
      </Link>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/help"
            aria-label={t("help")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <HelpCircle className="h-5 w-5" />
          </Link>
          <LocaleSwitcher />
          <NotificationsBell />
        </div>
        <div className="hidden md:block">
          <UserMenu profile={profile} />
        </div>
        <MobileNav profile={profile} />
      </div>
    </header>
  );
}
