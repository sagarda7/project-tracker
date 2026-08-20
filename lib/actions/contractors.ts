"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth-helpers";
import { contractorSchema, ContractorFormValues } from "@/lib/validations/contractor";
import { actionError, ActionResult } from "@/lib/action-utils";

export async function createContractorAction(
  values: ContractorFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireUser();
    const parsed = contractorSchema.parse(values);

    const contractor = await prisma.contractor.create({
      data: {
        name: parsed.name,
        companyName: parsed.companyName || null,
        phone: parsed.phone,
        alternatePhone: parsed.alternatePhone || null,
        email: parsed.email || null,
        address: parsed.address || null,
        contactPerson: parsed.contactPerson || null,
        notes: parsed.notes || null,
      },
    });

    revalidatePath("/contractors");
    return { success: true, data: { id: contractor.id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateContractorAction(
  id: string,
  values: ContractorFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireUser();
    const parsed = contractorSchema.parse(values);

    await prisma.contractor.update({
      where: { id },
      data: {
        name: parsed.name,
        companyName: parsed.companyName || null,
        phone: parsed.phone,
        alternatePhone: parsed.alternatePhone || null,
        email: parsed.email || null,
        address: parsed.address || null,
        contactPerson: parsed.contactPerson || null,
        notes: parsed.notes || null,
      },
    });

    revalidatePath("/contractors");
    revalidatePath(`/contractors/${id}`);
    return { success: true, data: { id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteContractorAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.contractor.delete({ where: { id } });
    revalidatePath("/contractors");
    return { success: true, data: undefined };
  } catch (e) {
    return actionError(e);
  }
}
