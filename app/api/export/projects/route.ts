import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { PROJECT_CSV_COLUMNS } from "@/lib/validations/csv";
import { formatDateInput } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });

  const rows = projects.map((p) => ({
    name: p.name,
    province: p.province,
    district: p.district,
    municipality: p.municipality,
    ward: p.ward,
    locationDescription: p.locationDescription ?? "",
    contractorName: p.contractorName ?? "",
    contractorPhone: p.contractorPhone ?? "",
    contactPersonName: p.contactPersonName ?? "",
    contactPersonPhone: p.contactPersonPhone ?? "",
    governingBody: p.governingBody,
    status: p.status,
    budget: String(p.budget),
    startDate: formatDateInput(p.startDate),
    deadline: formatDateInput(p.deadline),
    description: p.description ?? "",
  }));

  const csv = toCsv(PROJECT_CSV_COLUMNS, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="projects-export.csv"`,
    },
  });
}
