"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import { isDevPreview } from "@/lib/dev/mock-data";
import { useRouter } from "@/i18n/navigation";
import { initials } from "@/lib/utils";

export function AvatarUpload({
  userId,
  fullName,
  avatarUrl,
}: {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
}) {
  const t = useTranslations("settings");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  async function handleFile(file: File) {
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    if (isDevPreview()) {
      setUploading(false);
      return;
    }

    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
    });

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile({ avatar_url: data.publicUrl });
      router.refresh();
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={preview ?? undefined} alt="" />
          <AvatarFallback className="text-xl">{initials(fullName)}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label={t("changeAvatar")}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-white shadow-soft transition-colors hover:bg-navy-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <p className="text-sm text-muted-foreground">{t("changeAvatar")}</p>
    </div>
  );
}
