import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["kk", "ru"],
  defaultLocale: "kk",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
