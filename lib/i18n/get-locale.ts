import "server-only";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { DEFAULT_LOCALE, isLocale, Locale, LOCALE_COOKIE } from "@/lib/i18n/config";

/** Resolves the active locale for a server render: cookie takes precedence (it reflects
 * the user's last explicit choice, e.g. before login), falling back to the signed-in
 * user's saved preference, then the default. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const session = await auth();
  const userLanguage = session?.user?.language;
  if (userLanguage === "NE") return "ne";
  if (userLanguage === "EN") return "en";

  return DEFAULT_LOCALE;
}
