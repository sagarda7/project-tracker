import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users as UsersIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { DataTable, Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleBadge } from "@/components/ui/status-badge";
import { UserFilters } from "@/components/users/user-filters";
import { UserRowActions } from "@/components/users/user-row-actions";
import { formatDate } from "@/lib/utils";
import { User } from "@prisma/client";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const { q = "", role = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const where = {
    AND: [
      q ? { OR: [{ fullName: { contains: q } }, { email: { contains: q } }] } : {},
      role ? { role: role as "ADMIN" | "USER" } : {},
    ],
  };

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const columns: Column<User>[] = [
    {
      key: "name",
      header: translate(dict, "users.fullName"),
      render: (u) => (
        <div>
          <p className="font-medium text-gray-900">{u.fullName}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    { key: "phone", header: translate(dict, "common.phone"), render: (u) => u.phone || "—" },
    { key: "role", header: translate(dict, "users.role"), render: (u) => <RoleBadge role={u.role} label={u.role} /> },
    {
      key: "status",
      header: translate(dict, "common.status"),
      render: (u) => (
        <span className={u.isActive ? "text-green-700" : "text-gray-400"}>
          {u.isActive ? translate(dict, "common.active") : translate(dict, "common.inactive")}
        </span>
      ),
    },
    { key: "createdAt", header: translate(dict, "projects.createdAt"), render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: translate(dict, "common.actions"),
      render: (u) => <UserRowActions id={u.id} isActive={u.isActive} isSelf={u.id === session.user.id} />,
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "users.title")}</h1>
        <Link
          href="/users/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {translate(dict, "users.newUser")}
        </Link>
      </div>

      <UserFilters />

      {users.length === 0 ? (
        <EmptyState icon={UsersIcon} title={translate(dict, "users.noUsers")} />
      ) : (
        <div>
          <DataTable columns={columns} rows={users} />
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}
