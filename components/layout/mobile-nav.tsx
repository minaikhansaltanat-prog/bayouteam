"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, LogOut, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavList } from "./nav-list";
import { LocaleSwitcher } from "./locale-switcher";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/navigation";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

export function MobileNav({ profile }: { profile: Profile }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("nav.openMenu")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-foreground transition-colors hover:bg-surface-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 md:hidden"
        >
          <Menu className="h-6 w-6" strokeWidth={2.25} />
        </button>
      </SheetTrigger>
      <SheetContent closeLabel={t("nav.closeMenu")} className="w-[min(88vw,20rem)]">
        <SheetTitle className="sr-only">{t("nav.openMenu")}</SheetTitle>
        <div className="flex flex-col gap-6 px-5 pb-6 pt-16">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-mark.svg" alt="" width={32} height={32} />
            <div className="leading-tight">
              <div className="font-display text-base font-semibold text-foreground">
                BaYou team
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Hostel Management
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface-2 p-3.5">
            <Avatar className="h-11 w-11">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
              <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {profile.full_name ?? profile.email}
              </div>
              <Badge variant="navy" className="mt-0.5">
                {t(`roles.${profile.role}`)}
              </Badge>
            </div>
          </div>

          <NavList role={profile.role} variant="sheet" onNavigate={() => setOpen(false)} />

          <Link
            href="/help"
            onClick={() => setOpen(false)}
            className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-md)] px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <HelpCircle className="h-5 w-5 opacity-80" strokeWidth={2} />
            {t("nav.help")}
          </Link>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-[44px] items-center gap-2 rounded-[var(--radius-md)] px-3.5 text-sm font-medium text-danger transition-colors hover:bg-danger-bg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
