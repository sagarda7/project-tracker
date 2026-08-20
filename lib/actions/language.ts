"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

export async function setLanguageAction(locale: string) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const session = await auth();
  if (session?.user) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { language: locale === "ne" ? "NE" : "EN" },
    });
  }

  revalidatePath("/", "layout");
}
