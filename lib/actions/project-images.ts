"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { actionError, ActionResult } from "@/lib/action-utils";

function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be smaller than 5MB.";
  }
  return null;
}

export async function addProjectImageAction(
  projectId: string,
  formData: FormData
): Promise<ActionResult<{ id: string; url: string }>> {
  try {
    await requireUser();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Please select an image to upload." };
    }
    const validationError = validateImageFile(file);
    if (validationError) return { success: false, error: validationError };

    const caption = (formData.get("caption") as string | null)?.trim() || null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await storage.save(buffer, "projects", file.name);

    const existingCount = await prisma.projectImage.count({ where: { projectId } });

    const image = await prisma.projectImage.create({
      data: {
        projectId,
        fileName: file.name,
        filePath: saved.key,
        mimeType: file.type,
        fileSize: file.size,
        caption,
        isMain: existingCount === 0,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: { id: image.id, url: saved.url } };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteProjectImageAction(imageId: string): Promise<ActionResult> {
  try {
    await requireUser();
    const image = await prisma.projectImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: "Image not found." };

    await prisma.projectImage.delete({ where: { id: imageId } });
    await storage.remove(image.filePath);

    if (image.isMain) {
      const nextImage = await prisma.projectImage.findFirst({
        where: { projectId: image.projectId },
        orderBy: { createdAt: "asc" },
      });
      if (nextImage) {
        await prisma.projectImage.update({ where: { id: nextImage.id }, data: { isMain: true } });
      }
    }

    revalidatePath(`/projects/${image.projectId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function setMainProjectImageAction(
  projectId: string,
  imageId: string
): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.$transaction([
      prisma.projectImage.updateMany({ where: { projectId }, data: { isMain: false } }),
      prisma.projectImage.update({ where: { id: imageId }, data: { isMain: true } }),
    ]);
    revalidatePath(`/projects/${projectId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateProjectImageCaptionAction(
  imageId: string,
  caption: string
): Promise<ActionResult> {
  try {
    await requireUser();
    const image = await prisma.projectImage.update({
      where: { id: imageId },
      data: { caption: caption.trim() || null },
    });
    revalidatePath(`/projects/${image.projectId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
