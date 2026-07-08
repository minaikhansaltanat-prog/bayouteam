import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, CalendarCheck2, HelpCircle, MessagesSquare, Users2 } from "lucide-react";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { Link } from "@/i18n/navigation";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; blocked?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error, blocked } = await searchParams;
  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-navy-500/30 blur-3xl"
          aria-hidden
        />

        <Image
          src="/logo-full-transparent.png"
          alt="BaYou team"
          width={220}
          height={112}
          className="relative z-10 h-auto w-56"
          priority
        />

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-3xl font-semibold leading-tight text-white xl:text-4xl">
            {t("loginTitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-navy-100/80">
            {t("loginSubtitle")}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: Users2, key: "roles" },
              { icon: CalendarCheck2, key: "deadlines" },
              { icon: MessagesSquare, key: "protocols" },
            ].map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <Icon className="h-5 w-5 text-gold-400" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-navy-200/60">
          © {new Date().getFullYear()} BaYou team — Hostel Management Platform
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 text-center lg:hidden">
            <Image src="/logo-mark.svg" alt="" width={48} height={48} />
            <div>
              <div className="font-display text-xl font-semibold text-foreground">
                BaYou team
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Hostel Management Platform
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-7 shadow-elevated sm:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {t("loginTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:hidden">
              {t("loginSubtitle")}
            </p>

            {(error || blocked) && (
              <div className="mt-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{blocked || error === "not_invited" ? t("notInvited") : tc("errorGeneric")}</span>
              </div>
            )}

            <div className="mt-6">
              <GoogleLoginButton />
            </div>

            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
              {t("loginFooter")}
            </p>
          </div>

          <Link
            href="/help"
            className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 rounded-[var(--radius-sm)]"
          >
            <HelpCircle className="h-4 w-4" />
            {locale === "kk" ? "Кіру қиынға түсіп жатыр ма? Қалай кіру керек?" : "Не получается войти? Как войти?"}
          </Link>
        </div>
      </div>
    </div>
  );
}
