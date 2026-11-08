import { cookies } from "next/headers";
import { parseLocale, Locale, LOCALE_COOKIE } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(LOCALE_COOKIE);
  return parseLocale(cookie?.value);
}