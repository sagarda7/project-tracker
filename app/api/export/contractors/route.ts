import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { CONTRACTOR_CSV_COLUMNS } from "@/lib/validations/csv";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contractors = await prisma.contractor.findMany({ orderBy: { createdAt: "desc" } });

  const rows = contractors.map((c) => ({
    name: c.name,
    companyName: c.companyName ?? "",
    phone: c.phone,
    alternatePhone: c.alternatePhone ?? "",
    email: c.email ?? "",
    address: c.address ?? "",
    contactPerson: c.contactPerson ?? "",
    notes: c.notes ?? "",
  }));

  const csv = toCsv(CONTRACTOR_CSV_COLUMNS, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contractors-export.csv"`,
    },
  });
}
