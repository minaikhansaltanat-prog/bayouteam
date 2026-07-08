"use client";

import { useTranslations } from "next-intl";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

export function UserMenu({ profile }: { profile: Profile }) {
  const t = useTranslations();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-surface-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          aria-label={t("nav.profile")}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
            <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground md:block">
            {profile.full_name?.split(" ")[0] ?? profile.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{profile.full_name}</span>
          <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
          <Badge variant="navy" className="mt-1 w-fit">
            {t(`roles.${profile.role}`)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <UserIcon className="h-4 w-4" /> {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Settings className="h-4 w-4" /> {t("settings.title")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onSelect={handleLogout}>
          <LogOut className="h-4 w-4" /> {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
