"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { isDevPreview } from "@/lib/dev/mock-data";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export function NotificationsBell() {
  const t = useTranslations("notifications");
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isDevPreview()) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("id, type, payload, read_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (active) {
        setItems((data as NotificationRow[]) ?? []);
        setLoaded(true);
      }
    }

    load();

    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const unread = items.filter((item) => !item.read_at).length;

  async function markAllRead() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    setItems((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("empty")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {!loaded ? (
          <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">…</div>
        ) : items.length === 0 ? (
          <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={cn("flex-col items-start gap-0.5", !item.read_at && "bg-navy-50")}
              >
                <span className="text-sm text-foreground">
                  {t.has(item.type) ? t(item.type as never) : item.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {unread > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button variant="ghost" size="sm" className="w-full" onClick={markAllRead}>
              {t("markAllRead")}
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
