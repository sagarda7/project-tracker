import Link from "next/link";
import { Plus, HardHat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ContractorSearch } from "@/components/contractors/contractor-search";
import { ContractorRowActions } from "@/components/contractors/contractor-row-actions";
import { Contractor } from "@prisma/client";

export default async function ContractorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { companyName: { contains: q } },
          { phone: { contains: q } },
          { contactPerson: { contains: q } },
        ],
      }
    : {};

  const [contractors, totalItems] = await Promise.all([
    prisma.contractor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contractor.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const canDelete = session?.user.role === "ADMIN";

  const columns: Column<Contractor>[] = [
    { key: "name", header: translate(dict, "contractors.contractorName"), render: (c) => (
      <div>
        <p className="font-medium text-gray-900">{c.name}</p>
        {c.companyName && <p className="text-xs text-gray-500">{c.companyName}</p>}
      </div>
    ) },
    { key: "phone", header: translate(dict, "common.phone"), render: (c) => c.phone },
    { key: "contactPerson", header: translate(dict, "contractors.contactPerson"), render: (c) => c.contactPerson || "—" },
    { key: "email", header: translate(dict, "common.email"), render: (c) => c.email || "—" },
    {
      key: "actions",
      header: translate(dict, "common.actions"),
      render: (c) => <ContractorRowActions id={c.id} canDelete={canDelete} />,
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "contractors.title")}</h1>
        <Link
          href="/contractors/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {translate(dict, "contractors.newContractor")}
        </Link>
      </div>

      <ContractorSearch />

      {contractors.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title={translate(dict, "contractors.noContractors")}
          description={translate(dict, "empty.noResults")}
        />
      ) : (
        <div className="space-y-0">
          <DataTable columns={columns} rows={contractors} />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
