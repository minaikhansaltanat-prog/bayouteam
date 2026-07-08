import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, ExternalLink, ShieldAlert, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { AnnotatedScreenshot } from "@/components/help/annotated-screenshot";

const SITE_URL = "https://bayouteam-djtu.vercel.app";

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const kk = locale === "kk";

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <Link href="/login" className="flex items-center gap-2.5">
          <Image src="/logo-mark.svg" alt="" width={30} height={30} />
          <span className="font-display text-base font-semibold text-foreground">
            BaYou team
          </span>
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {kk ? "Жүйеге кіру нұсқаулығы" : "Инструкция по входу в систему"}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {kk
              ? "BaYou team платформасына алғаш рет кіру үшін төмендегі қадамдарды ретімен орындаңыз."
              : "Чтобы впервые войти в платформу BaYou team, выполните шаги ниже по порядку."}
          </p>
        </div>

        <ol className="flex flex-col gap-10">
          <Step
            number={1}
            title={kk ? "Сайтты ашыңыз" : "Откройте сайт"}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {kk ? "Браузерде мына сілтемені ашыңыз:" : "Откройте в браузере эту ссылку:"}
            </p>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-navy-50 px-3.5 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-100"
            >
              {SITE_URL.replace("https://", "")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Step>

          <Step
            number={2}
            title={kk ? '"Google арқылы кіру" батырмасын басыңыз' : 'Нажмите «Войти через Google»'}
          >
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {kk
                ? "Ашылған беттің оң жағында (телефонда — ортасында) осы батырма тұрады. Қызыл дөңгеленген жерді басыңыз:"
                : "Справа на открывшейся странице (на телефоне — по центру) находится эта кнопка. Нажмите там, где обведено красным:"}
            </p>
            <AnnotatedScreenshot
              src="/guide-login.png"
              alt="Login page"
              width={1280}
              height={800}
              label={kk ? "Осы жерді басыңыз" : "Нажмите здесь"}
              markers={[{ top: 52.5, left: 75, boxWidth: 30, boxHeight: 11 }]}
            />
          </Step>

          <Step
            number={3}
            title={kk ? "Gmail есептік жазбаңызды таңдаңыз" : "Выберите свой аккаунт Gmail"}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {kk
                ? "Google өз терезесін ашады — сол жерден жұмыс(тың) Gmail адресіңізді таңдаңыз (немесе енгізіңіз) де, құпиясөзіңізді жазыңыз."
                : "Откроется окно Google — выберите (или введите) свой рабочий Gmail-адрес и введите пароль."}
            </p>
            <div className="mt-3 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-warning/30 bg-warning-bg px-3.5 py-3 text-sm text-warning">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {kk
                  ? "Тек бас әкімші (Owner) алдын ала шақырған Gmail-дар ғана кіре алады. Егер сіздің email-ыңыз әлі шақырылмаса, әкімшіге хабарласыңыз."
                  : "Войти могут только Gmail-адреса, заранее приглашённые владельцем (Owner). Если ваш email ещё не приглашён, обратитесь к администратору."}
              </span>
            </div>
          </Step>

          <Step number={4} title={kk ? "Дайын!" : "Готово!"} last>
            <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-success/30 bg-success-bg px-3.5 py-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {kk
                  ? "Сіз автоматты түрде Басты бетке (Dashboard) өтесіз — сол жерден өз тапсырмаларыңызды, жобаларды көре бастайсыз."
                  : "Вы автоматически попадёте на Главную страницу (Dashboard) — там сразу увидите свои задачи и проекты."}
              </span>
            </div>
          </Step>
        </ol>

        <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface-2 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <ShieldAlert className="h-5 w-5 text-navy-500" />
            {kk ? "Сайт ашылмай жатса не істеу керек?" : "Что делать, если сайт не открывается?"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {kk
              ? "Кейбір компьютерлерде браузер \"қауіпсіз қосылым орнатылмады\" (SSL қатесі) деп көрсетуі мүмкін. Бұл сайттың өзінде емес, сол компьютерде болады. Мыналарды кезекпен тексеріңіз:"
              : "На некоторых компьютерах браузер может показать ошибку «небезопасное соединение» (SSL). Это связано не с самим сайтом, а с настройками компьютера. Проверьте по порядку:"}
          </p>
          <ul className="ml-4 list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li>
              {kk
                ? "Компьютердің күні мен уақыты дұрыс қойылғанын тексеріңіз"
                : "Убедитесь, что дата и время на компьютере выставлены верно"}
            </li>
            <li>
              {kk
                ? "Антивирус бағдарламасындағы \"HTTPS/шифрланған қосылымды сканерлеу\" функциясын уақытша өшіріңіз"
                : "Временно отключите функцию «сканирование HTTPS/зашифрованных соединений» в антивирусе"}
            </li>
            <li>
              {kk
                ? "Инкогнито терезеде (Ctrl+Shift+N) немесе басқа браузерде ашып көріңіз"
                : "Попробуйте открыть в режиме инкогнито (Ctrl+Shift+N) или в другом браузере"}
            </li>
            <li>
              {kk
                ? "Телефоннан мобильді интернетпен ашып көріңіз — ашылса, мәселе тек сол компьютерде"
                : "Попробуйте открыть с телефона через мобильный интернет — если открылось, проблема именно в этом компьютере"}
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function Step({
  number,
  title,
  children,
  last,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pl-1">
      {!last && (
        <span className="absolute left-[19px] top-10 h-[calc(100%+1rem)] w-px bg-border" />
      )}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 font-display text-base font-semibold text-white">
        {number}
      </span>
      <div className="flex-1 pt-1.5">
        <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{title}</h3>
        {children}
      </div>
    </li>
  );
}
