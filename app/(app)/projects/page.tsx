import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { parseFilters } from "@/lib/project-filters";
import { getProjectListPage } from "@/lib/data/projects";
import { isOverdue, PAGE_SIZE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, OverdueBadge } from "@/components/ui/status-badge";
import { ProjectFilterPanel } from "@/components/projects/project-filters";
import { ProjectRowActions } from "@/components/projects/project-row-actions";
import { Project } from "@prisma/client";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseFilters(rawParams);
  const [session, locale, { projects, totalItems, page, totalPages }] = await Promise.all([
    auth(),
    getLocale(),
    getProjectListPage(filters),
  ]);
  const dict = getDictionary(locale);
  const canDelete = session?.user.role === "ADMIN";

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: translate(dict, "projects.projectName"),
      render: (p) => (
        <div>
          <Link href={`/projects/${p.id}`} className="font-medium text-gray-900 hover:text-primary">
            {p.name}
          </Link>
          {isOverdue(p.deadline, p.status) && (
            <div className="mt-1">
              <OverdueBadge label={translate(dict, "projects.overdue")} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: translate(dict, "projects.location"),
      render: (p) => (
        <span className="text-sm text-gray-600">
          {p.municipality}, {p.district}
        </span>
      ),
    },
    {
      key: "contractor",
      header: translate(dict, "projects.contractor"),
      render: (p) => p.contractorName || "—",
    },
    {
      key: "governingBody",
      header: translate(dict, "projects.governingBody"),
      render: (p) => translate(dict, `governingBody.${p.governingBody}`),
    },
    {
      key: "status",
      header: translate(dict, "common.status"),
      render: (p) => <StatusBadge status={p.status} label={translate(dict, `status.${p.status}`)} />,
    },
    { key: "budget", header: translate(dict, "common.budget"), render: (p) => formatCurrency(p.budget) },
    { key: "deadline", header: translate(dict, "projects.deadline"), render: (p) => formatDate(p.deadline) },
    {
      key: "actions",
      header: translate(dict, "common.actions"),
      render: (p) => <ProjectRowActions id={p.id} canDelete={canDelete} />,
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "projects.title")}</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {translate(dict, "projects.newProject")}
        </Link>
      </div>

      <ProjectFilterPanel initial={filters} />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={translate(dict, "projects.noProjects")}
          description={translate(dict, "projects.noProjectsHint")}
        />
      ) : (
        <div>
          <DataTable columns={columns} rows={projects} />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
