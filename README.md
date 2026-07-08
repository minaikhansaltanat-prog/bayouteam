# BaYou team — Hostel Management Platform

Командалық жобаларды басқару платформасы. Техникалық тапсырма (v1.0, 08.07.2026) негізінде салынған Next.js 16 + Supabase қосымшасы.

## Стек

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Radix UI примитивтері
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime + Row-Level Security)
- **i18n:** next-intl (қазақша әдепкі, орысша) — `/kk/...`, `/ru/...`
- **Drag-and-drop:** dnd-kit (Kanban тақтасы)
- **Формалар:** react-hook-form

## Қазір не істейді (MVP + V1 бөлігі)

- Google OAuth арқылы кіру, тек шақырылған Gmail-дар (`allowed_emails` кестесі, DB триггері арқылы қатаң бекітілген)
- Профиль, аватар жүктеу, рөлдер (Owner/Admin/Editor/Member/Guest), RLS арқылы дерекқор деңгейіндегі қатаң қолжетімділік
- Жобалар: құру, логотип, мақсат/мерзім, мүшелер, мұрағаттау
- Тапсырмалар: толық өрістер, Kanban тақтасы (сүйреп жылжыту), тізім көрінісі, "Тек менің тапсырмаларым" сүзгісі, чек-лист, комментарийлер
- **Тапсырма тізбегі (chain):** бір адамнан екіншісіне автоматты өту, қайтару себебімен — толығымен Postgres триггерімен іске асырылған
- Жиналыстар/хаттамалар: күн тәртібі, шешімдер, "Тапсырмаға айналдыру" бір батырмамен
- Файлдар: жоба/тапсырма деңгейінде жүктеу, жеке (private) Storage bucket + уақытша қол қойылған сілтемелер
- Бөлісу сілтемелері (share links): құпиясөз, мерзім, аудит журналы — SQL деңгейінде дайын
- Әкімші панелі: мүшелерді шақыру, рөл өзгерту, бұғаттау, қате-лимит орнату (мүшеге көрінбейді), құқықтар матрицасы
- Толық аудит журналы (audit_log) — барлық негізгі әрекеттер
- kk ↔ ru тіл ауыстыру, Astana уақыт белдеуі (UTC+5)
- Мобильді: гормошка мәзір (X батырмасымен жабылады), горизонталды скролл жоқ, body scroll-lock

## Әлі жасалмаған (V2 кезеңі — ТЗ 7-бөлім бойынша жоспарлы)

Бұлар үшін нақты API кілттері (OpenAI, Meta WhatsApp Business, Resend) қажет және бөлек сессияда қосылады:

- AI: аудио→мәтін транскрибация (Whisper), скилл-кеңестер, келісімшарт-сәйкестік анализі
- WhatsApp хабарламалар (Meta Cloud API)
- Толық аналитика дашборды, рейтинг-тақта, апталық дайджест
- Word/PDF экспорт
- Telegram-бот, PWA

Осыларға арналған дерекқор кестелері мен RLS саясаттары **қазірдің өзінде дайын** (`supabase/migrations/`) — тек UI мен сыртқы API интеграциясы қалды.

## Алғашқы баптау

### 1. Supabase жобасын жасау

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project** (тегін тариф жеткілікті)
2. **Settings → API** бетінен `Project URL`, `anon public key`, `service_role key` көшіріп алыңыз
3. **SQL Editor**-ге өтіп, `supabase/migrations/` папкасындағы файлдарды **нөмір ретімен** (0001 → 0007) бірінен соң бірін іске қосыңыз (немесе Supabase CLI болса: `supabase db push`)
4. `.env.local` файлын жасаңыз (`.env.example`-ді көшіріп), Supabase мәндерін қойыңыз

### 2. Google OAuth орнату

1. [Google Cloud Console](https://console.cloud.google.com/) → жаңа жоба → **APIs & Services → Credentials → Create OAuth Client ID** (Web application)
2. Authorized redirect URI: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Client ID/Secret-ті Supabase Dashboard → **Authentication → Providers → Google** бөліміне қойыңыз
4. `supabase/migrations/0006_seed.sql` файлында Owner-дің Gmail-ы алдын ала жазылған (`minaikhan.saltanat@gmail.com`) — соны бірінші рет кіргенде "Owner" рөлі автоматты беріледі. Басқа мүшелерді `/admin` бетінен шақыруға болады.

### 3. Локалды іске қосу

```bash
npm install
npm run dev
```

`http://localhost:3000` — `/kk` немесе `/ru` дейін автоматты бағытталады.

### 4. Дизайн-preview режимі (Supabase баптаусыз)

`.env.local` файлында:

```
NEXT_PUBLIC_DEV_PREVIEW=1
```

қойсаңыз, интерфейс нақты Supabase/Google OAuth-сыз үлгі (mock) деректермен толық шолынады — дизайнды тексеру үшін. **Production-ға шығарар алдында бұл жолды міндетті түрде өшіріңіз немесе жойыңыз.**

## Скриншот жұмыс тәртібі

```bash
npm run dev                                   # localhost:3000 фонда
node screenshot.mjs http://localhost:3000/kk/dashboard label 1440 900 --full
```

Скриншоттар `./temporary screenshots/` папкасына сақталады.

## Деплой (Vercel)

1. Репозиторийді GitHub-қа жүктеңіз (private)
2. Vercel-де жобаны импорттаңыз, барлық `.env.example` айнымалыларын Environment Variables-ке қосыңыз
3. `NEXT_PUBLIC_DEV_PREVIEW`-ды қоспаңыз/бос қалдырыңыз
4. Push әр жаңартуда автоматты деплой болады

## Ақаулықтарды жою

- **Кейбір беттер 404 қайтарса / маршруттар "жоғалып кетсе":** Turbopack-тің persistent cache-і Windows-та кириллица әріптері бар жол атауларында (`Жоба Басқару`) кейде бүлінеді (`Persisting failed: Unable to write SST file`). Шешімі: dev серверді тоқтатып, `.next` папкасын өшіріп, қайта іске қосыңыз:
  ```bash
  rm -rf .next
  npm run dev
  ```

## Дерекқор схемасы

`supabase/migrations/` реті:

| Файл | Мазмұны |
|---|---|
| `0001_schema.sql` | Барлық кестелер, типтер, индекстер |
| `0002_functions.sql` | RLS көмекші функциялары (`is_owner`, `can_edit_project`...) |
| `0003_rls.sql` | Row-Level Security саясаттары |
| `0004_triggers.sql` | Invite allowlist, тізбек автоматтандыру, хабарлама, аудит |
| `0005_storage.sql` | Storage buckets + саясаттар |
| `0006_seed.sql` | Owner-ді шақыру тізіміне қосу |
| `0007_share_password.sql` | Бөлісу сілтемесі құпиясөзін хэштеу функциясы |
