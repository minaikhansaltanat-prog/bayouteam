import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

export async function ComingSoon({ title }: { title?: string }) {
  const t = await getTranslations("common");
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Sparkles className="h-9 w-9 text-gold-500" strokeWidth={1.5} />
        <p className="text-base font-semibold text-foreground">
          {title ?? t("comingSoonTitle")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("comingSoonBody")}</p>
      </CardContent>
    </Card>
  );
}
