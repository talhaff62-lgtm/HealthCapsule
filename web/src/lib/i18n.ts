import en from "@/i18n/en.json";
import bn from "@/i18n/bn.json";

export type Locale = "en" | "bn";

export const LOCALE_COOKIE = "capsule_lang";

export const DEFAULT_LOCALE: Locale = "bn";

export const locales: Locale[] = ["en", "bn"];

export function parseLocale(v: string | undefined | null): Locale {
  if (v && (v === "en" || v === "bn")) return v;
  return DEFAULT_LOCALE;
}

const dictionaries: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  bn: bn as Record<string, string>,
};

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function getT(locale: Locale): TFn {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const fallbackDict = dictionaries.en;

  return (key: string, vars?: Record<string, string | number>): string => {
    let value = dict[key];
    if (value === undefined) {
      value = fallbackDict[key];
    }
    if (value === undefined) {
      return key;
    }

    if (vars) {
      return value.replace(/\{(\w+)\}/g, (_, name) => {
        const v = vars[name];
        return v !== undefined ? String(v) : `{${name}}`;
      });
    }

    return value;
  };
}