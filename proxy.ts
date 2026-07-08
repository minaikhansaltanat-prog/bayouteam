import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const PUBLIC_SEGMENTS = ["login"];

export function proxy(request: NextRequest) {
  return handleAuth(request);
}

async function handleAuth(request: NextRequest) {
  const response = handleI18nRouting(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured yet — let requests through so the app is
    // still browsable/screenshot-able while credentials are being set up.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = routing.locales.includes(segments[0] as never)
    ? segments[0]
    : routing.defaultLocale;
  const rest = routing.locales.includes(segments[0] as never)
    ? segments.slice(1)
    : segments;
  const isPublic = rest.length > 0 && PUBLIC_SEGMENTS.includes(rest[0]);
  const isRoot = rest.length === 0;

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (user && (rest[0] === "login" || isRoot)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
