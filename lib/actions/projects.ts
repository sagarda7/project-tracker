"use server";

import { revalidatePath } from "next/cache";
import { GoverningBody, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-helpers";
import { projectSchema, ProjectFormValues, statusUpdateSchema } from "@/lib/validations/project";
import { actionError, ActionResult } from "@/lib/action-utils";

async function resolveContractorFields(parsed: ReturnType<typeof projectSchema.parse>) {
  if (parsed.contractorId) {
    const contractor = await prisma.contractor.findUnique({ where: { id: parsed.contractorId } });
    if (!contractor) throw new Error("Selected contractor was not found.");
    return { contractorId: contractor.id, contractorName: contractor.name, contractorPhone: contractor.phone };
  }
  return {
    contractorId: null,
    contractorName: parsed.contractorName || null,
    contractorPhone: parsed.contractorPhone || null,
  };
}

export async function createProjectAction(
  values: ProjectFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const parsed = projectSchema.parse(values);
    const contractorFields = await resolveContractorFields(parsed);

    const project = await prisma.project.create({
      data: {
        name: parsed.name,
        province: parsed.province,
        district: parsed.district,
        municipality: parsed.municipality,
        ward: parsed.ward,
        locationDescription: parsed.locationDescription || null,
        ...contractorFields,
        contactPersonName: parsed.contactPersonName || null,
        contactPersonPhone: parsed.contactPersonPhone || null,
        governingBody: parsed.governingBody as GoverningBody,
        status: parsed.status as ProjectStatus,
        budget: Number(parsed.budget),
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        deadline: parsed.deadline ? new Date(parsed.deadline) : null,
        description: parsed.description || null,
        createdById: user.id,
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: parsed.status as ProjectStatus,
            changedById: user.id,
            comment: "Project created.",
          },
        },
      },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, data: { id: project.id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateProjectAction(
  id: string,
  values: ProjectFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const parsed = projectSchema.parse(values);
    const contractorFields = await resolveContractorFields(parsed);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Project not found." };

    const newStatus = parsed.status as ProjectStatus;
    const statusChanged = existing.status !== newStatus;

    await prisma.project.update({
      where: { id },
      data: {
        name: parsed.name,
        province: parsed.province,
        district: parsed.district,
        municipality: parsed.municipality,
        ward: parsed.ward,
        locationDescription: parsed.locationDescription || null,
        ...contractorFields,
        contactPersonName: parsed.contactPersonName || null,
        contactPersonPhone: parsed.contactPersonPhone || null,
        governingBody: parsed.governingBody as GoverningBody,
        status: newStatus,
        budget: Number(parsed.budget),
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        deadline: parsed.deadline ? new Date(parsed.deadline) : null,
        description: parsed.description || null,
        ...(statusChanged
          ? {
              statusHistory: {
                create: {
                  previousStatus: existing.status,
                  newStatus,
                  changedById: user.id,
                  comment: "Status changed via project edit.",
                },
              },
            }
          : {}),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: { id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateProjectStatusAction(
  id: string,
  values: { status: string; comment?: string }
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = statusUpdateSchema.parse(values);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Project not found." };

    const newStatus = parsed.status as ProjectStatus;
    if (existing.status === newStatus) {
      return { success: false, error: "Project is already in this status." };
    }

    await prisma.project.update({
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

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.project.delete({ where: { id } });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
