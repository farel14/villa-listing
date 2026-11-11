import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { en, tr, type Dictionary } from "./dictionaries";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "locale";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
});

export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: locale === "en" ? en : tr };
}

/** Picks the Turkish or English variant of a bilingual record. */
export function pick<T extends { nameTr: string; nameEn: string }>(item: T, locale: Locale) {
  return locale === "en" ? item.nameEn : item.nameTr;
}
