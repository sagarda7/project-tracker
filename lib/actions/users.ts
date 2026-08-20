"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createUserSchema,
  CreateUserFormValues,
  updateUserSchema,
  UpdateUserFormValues,
  resetPasswordSchema,
} from "@/lib/validations/user";
import { Language, Role } from "@prisma/client";
import { actionError, ActionResult } from "@/lib/action-utils";

export async function createUserAction(
  values: CreateUserFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = createUserSchema.parse(values);

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return { success: false, error: "A user with this email already exists." };

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone || null,
        passwordHash,
        role: parsed.role as Role,
        language: parsed.language as Language,
      },
    });

    revalidatePath("/users");
    return { success: true, data: { id: user.id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateUserAction(
  id: string,
  values: UpdateUserFormValues
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = updateUserSchema.parse(values);

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A user with this email already exists." };
    }

    await prisma.user.update({
      where: { id },
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone || null,
        role: parsed.role as Role,
        language: parsed.language as Language,
        isActive: parsed.isActive,
      },
    });

    revalidatePath("/users");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function toggleUserActiveAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === id) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
    revalidatePath("/users");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function resetPasswordAction(
  id: string,
  values: { password: string }
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = resetPasswordSchema.parse(values);
    const passwordHash = await bcrypt.hash(parsed.password, 10);

    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (admin.id === id) {
      return { success: false, error: "You cannot delete your own account." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/users");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
