"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "@/i18n/navigation";
import type { NotificationChannel, Profile } from "@/lib/types/database";

const CHANNELS: NotificationChannel[] = ["email", "whatsapp", "inapp"];
const CHANNEL_LABEL_KEY: Record<NotificationChannel, "channelEmail" | "channelWhatsapp" | "channelInApp"> = {
  email: "channelEmail",
  whatsapp: "channelWhatsapp",
  inapp: "channelInApp",
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [position, setPosition] = useState(profile.position ?? "");
  const [phone, setPhone] = useState(profile.phone_whatsapp ?? "");
  const [skills, setSkills] = useState(profile.skills?.join(", ") ?? "");
  const [channels, setChannels] = useState<NotificationChannel[]>(
    profile.notification_channels ?? ["email", "inapp"],
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      full_name: fullName,
      position,
      phone_whatsapp: phone,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notification_channels: channels,
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full-name">{t("fullName")}</Label>
          <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">{t("position")}</Label>
          <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 7__ ___ ____" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="skills">{t("skills")}</Label>
          <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("notificationChannels")}</Label>
        <div className="flex flex-wrap gap-3">
          {CHANNELS.map((channel) => (
            <label
              key={channel}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50"
            >
              <Checkbox
                checked={channels.includes(channel)}
                onCheckedChange={(checked) =>
                  setChannels((prev) =>
                    checked ? [...prev, channel] : prev.filter((c) => c !== channel),
                  )
                }
              />
              {t(CHANNEL_LABEL_KEY[channel])}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? tc("saving") : tc("save")}
        </Button>
        {saved && <span className="text-sm font-medium text-success">{t("saved")}</span>}
      </div>
    </form>
  );
}
