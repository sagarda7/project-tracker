"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { followupNoteSchema } from "@/lib/validations/followup";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { actionError, ActionResult } from "@/lib/action-utils";

function parseFollowupFormData(formData: FormData) {
  return followupNoteSchema.parse({
    note: formData.get("note") ?? "",
    followupDate: formData.get("followupDate") ?? "",
    externalLink: formData.get("externalLink") ?? "",
  });
}

async function saveProofImageIfPresent(formData: FormData): Promise<string | null | undefined> {
  const file = formData.get("proofImage");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await storage.save(buffer, "followups", file.name);
  return saved.key;
}

export async function createFollowupNoteAction(
  projectId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const parsed = parseFollowupFormData(formData);
    const proofImagePath = await saveProofImageIfPresent(formData);

    const note = await prisma.projectFollowupNote.create({
      data: {
        projectId,
        note: parsed.note,
        followupDate: parsed.followupDate ? new Date(parsed.followupDate) : null,
        externalLink: parsed.externalLink || null,
        proofImagePath: proofImagePath || null,
        createdById: user.id,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { id: note.id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateFollowupNoteAction(
  noteId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseFollowupFormData(formData);
    const proofImagePath = await saveProofImageIfPresent(formData);
    const removeImage = formData.get("removeProofImage") === "true";

    const existing = await prisma.projectFollowupNote.findUnique({ where: { id: noteId } });
    if (!existing) return { success: false, error: "Note not found." };

    if (proofImagePath && existing.proofImagePath) {
      await storage.remove(existing.proofImagePath);
    }
    if (removeImage && existing.proofImagePath && !proofImagePath) {
      await storage.remove(existing.proofImagePath);
    }

    await prisma.projectFollowupNote.update({
      where: { id: noteId },
      data: {
        note: parsed.note,
        followupDate: parsed.followupDate ? new Date(parsed.followupDate) : null,
        externalLink: parsed.externalLink || null,
        ...(proofImagePath ? { proofImagePath } : removeImage ? { proofImagePath: null } : {}),
      },
    });

    revalidatePath(`/projects/${existing.projectId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteFollowupNoteAction(noteId: string): Promise<ActionResult> {
  try {
    await requireUser();
    const existing = await prisma.projectFollowupNote.findUnique({ where: { id: noteId } });
    if (!existing) return { success: false, error: "Note not found." };

    await prisma.projectFollowupNote.delete({ where: { id: noteId } });
    if (existing.proofImagePath) await storage.remove(existing.proofImagePath);

    revalidatePath(`/projects/${existing.projectId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
