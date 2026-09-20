import Link from "next/link";
import { Eye, MessageSquareWarning } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ComplaintStatusBadge } from "@/components/ui/complaint-status-badge";
import { ComplaintFilters } from "@/components/complaints/complaint-filters";
import { formatDate } from "@/lib/utils";
import { Complaint, ComplaintStatus } from "@prisma/client";

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const where = {
    AND: [
      q ? { OR: [{ name: { contains: q } }, { trackingCode: { contains: q.toUpperCase() } }] } : {},
      status ? { status: status as ComplaintStatus } : {},
    ],
  };

  const [complaints, totalItems] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.complaint.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const columns: Column<Complaint>[] = [
    {
      key: "trackingCode",
      header: translate(dict, "complaints.trackingCode"),
      render: (c) => <span className="font-mono font-medium text-gray-900">{c.trackingCode}</span>,
    },
    { key: "name", header: translate(dict, "complaints.complainantName"), render: (c) => c.name },
    {
      key: "address",
      header: translate(dict, "complaints.address"),
      render: (c) => (
        <span className="text-sm text-gray-600">
          {c.municipality}, {c.district}
        </span>
      ),
    },
    {
      key: "status",
      header: translate(dict, "common.status"),
      render: (c) => <ComplaintStatusBadge status={c.status} label={translate(dict, `complaintStatus.${c.status}`)} />,
    },
    { key: "createdAt", header: translate(dict, "projects.createdAt"), render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: translate(dict, "common.actions"),
      render: (c) => (
        <Link
          href={`/complaints/${c.id}`}
          className="inline-flex items-center gap-1 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={translate(dict, "common.view")}
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "complaints.title")}</h1>

      <ComplaintFilters />

      {complaints.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title={translate(dict, "complaints.noComplaints")} />
      ) : (
        <div>
          <DataTable columns={columns} rows={complaints} />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
