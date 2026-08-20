"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { profileUpdateSchema, ProfileUpdateFormValues, changePasswordSchema, ChangePasswordFormValues } from "@/lib/validations/user";
import { Language } from "@prisma/client";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { actionError, ActionResult } from "@/lib/action-utils";

export async function updateProfileAction(values: ProfileUpdateFormValues): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = profileUpdateSchema.parse(values);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: parsed.fullName,
        phone: parsed.phone || null,
        language: parsed.language as Language,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE, parsed.language === "NE" ? "ne" : "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    revalidatePath("/profile");
    revalidatePath("/", "layout");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function changePasswordAction(values: ChangePasswordFormValues): Promise<ActionResult> {
  try {
    const sessionUser = await requireUser();
    const parsed = changePasswordSchema.parse(values);

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) return { success: false, error: "User not found." };

    const valid = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
    if (!valid) return { success: false, error: "Current password is incorrect." };

    const passwordHash = await bcrypt.hash(parsed.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
