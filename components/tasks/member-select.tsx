"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/utils";

interface MemberLike {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function MemberSelect({
  members,
  value,
  onChange,
  placeholder,
}: {
  members: MemberLike[];
  value: string | null | undefined;
  onChange: (userId: string | null) => void;
  placeholder?: string;
}) {
  const t = useTranslations("common");

  return (
    <Select
      value={value ?? "__none"}
      onValueChange={(v) => onChange(v === "__none" ? null : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder ?? t("selectPlaceholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">—</SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <span className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-[9px]">
                  {initials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              {member.full_name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
