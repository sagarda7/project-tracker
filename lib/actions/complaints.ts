"use server";

import { revalidatePath } from "next/cache";
import { ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { storage } from "@/lib/storage";
import { generateTrackingCode } from "@/lib/tracking-code";
import {
  complaintSchema,
  trackCodeSchema,
  complaintStatusUpdateSchema,
  complaintNoteSchema,
} from "@/lib/validations/complaint";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/constants";
import { actionError, ActionResult } from "@/lib/action-utils";

function parseComplaintFormData(formData: FormData) {
  return complaintSchema.parse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    description: formData.get("description") ?? "",
    province: formData.get("province") ?? "",
    district: formData.get("district") ?? "",
    municipality: formData.get("municipality") ?? "",
    ward: formData.get("ward") ?? "",
    addressDetail: formData.get("addressDetail") ?? "",
  });
}

async function saveAttachments(
  formData: FormData,
  field: "photos" | "documents"
): Promise<{ kind: string; fileName: string; filePath: string; mimeType: string; fileSize: number }[]> {
  const allowedTypes = field === "photos" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
  const maxSize = field === "photos" ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
  const kind = field === "photos" ? "PHOTO" : "DOCUMENT";

  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  const saved = [];
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`"${file.name}" has an unsupported file type.`);
    }
    if (file.size > maxSize) {
      throw new Error(`"${file.name}" is too large.`);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storage.save(buffer, "complaints", file.name);
    saved.push({
      kind,
      fileName: file.name,
      filePath: result.key,
      mimeType: file.type,
      fileSize: file.size,
    });
  }
  return saved;
}

export async function submitComplaintAction(
  formData: FormData
): Promise<ActionResult<{ trackingCode: string }>> {
  try {
    const parsed = parseComplaintFormData(formData);
    const photoAttachments = await saveAttachments(formData, "photos");
    const documentAttachments = await saveAttachments(formData, "documents");

    let trackingCode = generateTrackingCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await prisma.complaint.findUnique({ where: { trackingCode } });
      if (!existing) break;
      trackingCode = generateTrackingCode();
    }

    await prisma.complaint.create({
      data: {
        trackingCode,
        name: parsed.name,
        phone: parsed.phone || null,
        description: parsed.description,
        province: parsed.province,
        district: parsed.district,
        municipality: parsed.municipality,
        ward: parsed.ward,
        addressDetail: parsed.addressDetail || null,
        attachments: {
          create: [...photoAttachments, ...documentAttachments],
        },
      },
    });

    revalidatePath("/complaints");
    return { success: true, data: { trackingCode } };
  } catch (e) {
    return actionError(e);
  }
}

export async function trackComplaintAction(code: string): Promise<
  ActionResult<{
    trackingCode: string;
    status: ComplaintStatus;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    notes: { id: string; note: string; createdAt: Date }[];
  }>
> {
  try {
    const parsed = trackCodeSchema.parse({ code });

    const complaint = await prisma.complaint.findUnique({
      where: { trackingCode: parsed.code },
      include: { notes: { orderBy: { createdAt: "asc" }, select: { id: true, note: true, createdAt: true } } },
    });

    if (!complaint) {
      return { success: false, error: "No complaint found with this tracking code." };
    }

    return {
      success: true,
      data: {
        trackingCode: complaint.trackingCode,
        status: complaint.status,
        description: complaint.description,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        notes: complaint.notes,
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateComplaintStatusAction(
  id: string,
  values: { status: string; comment?: string }
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = complaintStatusUpdateSchema.parse(values);

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Complaint not found." };

    const newStatus = parsed.status as ComplaintStatus;
    if (existing.status === newStatus) {
      return { success: false, error: "Complaint is already in this status." };
    }

    await prisma.complaint.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            previousStatus: existing.status,
            newStatus,
            changedById: user.id,
            comment: parsed.comment || null,
          },
        },
      },
    });

    revalidatePath(`/complaints/${id}`);
    revalidatePath("/complaints");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function createComplaintNoteAction(
  complaintId: string,
  values: { note: string }
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = complaintNoteSchema.parse(values);

    await prisma.complaintNote.create({
      data: { complaintId, note: parsed.note, createdById: user.id },
    });

    revalidatePath(`/complaints/${complaintId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateComplaintNoteAction(
  noteId: string,
  values: { note: string }
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = complaintNoteSchema.parse(values);

    const note = await prisma.complaintNote.update({
      where: { id: noteId },
      data: { note: parsed.note },
    });

    revalidatePath(`/complaints/${note.complaintId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteComplaintNoteAction(noteId: string): Promise<ActionResult> {
  try {
    await requireUser();
    const note = await prisma.complaintNote.findUnique({ where: { id: noteId } });
    if (!note) return { success: false, error: "Note not found." };

    await prisma.complaintNote.delete({ where: { id: noteId } });

    revalidatePath(`/complaints/${note.complaintId}`);
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
