import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") === "ru" ? "ru" : "kk";
  const next = `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const reason = /invite|database error saving new user/i.test(error.message)
      ? "not_invited"
      : "auth_error";
    return NextResponse.redirect(`${origin}/${locale}/login?error=${reason}`);
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_error`);
}
