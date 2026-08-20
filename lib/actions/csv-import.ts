"use server";

import { revalidatePath } from "next/cache";
import { GoverningBody, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { ProjectCsvRow, ContractorCsvRow } from "@/lib/validations/csv";
import { actionError, ActionResult } from "@/lib/action-utils";

export interface ImportSummary {
  totalRows: number;
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

export async function importProjectsCsvAction(
  rows: ProjectCsvRow[],
  fileName: string
): Promise<ActionResult<ImportSummary>> {
  try {
    const admin = await requireAdmin();
    const errors: { row: number; message: string }[] = [];
    let successCount = 0;
    let duplicateCount = 0;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const duplicate = await tx.project.findFirst({
            where: { name: row.name, municipality: row.municipality, ward: row.ward },
          });
          if (duplicate) {
            duplicateCount++;
            continue;
          }

          const created = await tx.project.create({
            data: {
              name: row.name,
              province: row.province,
              district: row.district,
              municipality: row.municipality,
              ward: row.ward,
              locationDescription: row.locationDescription || null,
              contractorName: row.contractorName || null,
              contractorPhone: row.contractorPhone || null,
              contactPersonName: row.contactPersonName || null,
              contactPersonPhone: row.contactPersonPhone || null,
              governingBody: row.governingBody as GoverningBody,
              status: row.status as ProjectStatus,
              budget: Number(row.budget),
              startDate: row.startDate ? new Date(row.startDate) : null,
              deadline: row.deadline ? new Date(row.deadline) : null,
              description: row.description || null,
              createdById: admin.id,
            },
          });

          await tx.projectStatusHistory.create({
            data: {
              projectId: created.id,
              previousStatus: null,
              newStatus: created.status,
              changedById: admin.id,
              comment: "Imported from CSV.",
            },
          });

          successCount++;
        } catch (rowError) {
          errors.push({
            row: i + 1,
            message: rowError instanceof Error ? rowError.message : "Failed to import this row.",
          });
        }
      }

      await tx.csvImportLog.create({
        data: {
          entityType: "PROJECT",
          fileName,
          totalRows: rows.length,
          successCount,
          errorCount: errors.length,
          errors: errors.length > 0 ? JSON.stringify(errors) : null,
          createdById: admin.id,
        },
      });
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return {
      success: true,
      data: { totalRows: rows.length, successCount, duplicateCount, errorCount: errors.length, errors },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function importContractorsCsvAction(
  rows: ContractorCsvRow[],
  fileName: string
): Promise<ActionResult<ImportSummary>> {
  try {
    const admin = await requireAdmin();
    const errors: { row: number; message: string }[] = [];
    let successCount = 0;
    let duplicateCount = 0;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const duplicate = await tx.contractor.findFirst({
            where: { name: row.name, phone: row.phone },
          });
          if (duplicate) {
            duplicateCount++;
            continue;
          }

          await tx.contractor.create({
            data: {
              name: row.name,
              companyName: row.companyName || null,
              phone: row.phone,
              alternatePhone: row.alternatePhone || null,
              email: row.email || null,
              address: row.address || null,
              contactPerson: row.contactPerson || null,
              notes: row.notes || null,
            },
          });

          successCount++;
        } catch (rowError) {
          errors.push({
            row: i + 1,
            message: rowError instanceof Error ? rowError.message : "Failed to import this row.",
          });
        }
      }

      await tx.csvImportLog.create({
        data: {
          entityType: "CONTRACTOR",
          fileName,
          totalRows: rows.length,
          successCount,
          errorCount: errors.length,
          errors: errors.length > 0 ? JSON.stringify(errors) : null,
          createdById: admin.id,
        },
      });
    });

    revalidatePath("/contractors");
    return {
      success: true,
      data: { totalRows: rows.length, successCount, duplicateCount, errorCount: errors.length, errors },
    };
  } catch (e) {
    return actionError(e);
  }
}
