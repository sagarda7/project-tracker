import { GoverningBody, Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NON_OVERDUE_STATUSES, PAGE_SIZE } from "@/lib/constants";
import { ProjectFilters } from "@/lib/project-filters";

export function buildProjectWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  const and: Prisma.ProjectWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { name: { contains: filters.q } },
        { province: { contains: filters.q } },
        { district: { contains: filters.q } },
        { municipality: { contains: filters.q } },
        { locationDescription: { contains: filters.q } },
        { contractorName: { contains: filters.q } },
        { contactPersonName: { contains: filters.q } },
      ],
    });
  }
  if (filters.status) and.push({ status: filters.status as ProjectStatus });
  if (filters.province) and.push({ province: filters.province });
  if (filters.district) and.push({ district: filters.district });
  if (filters.governingBody) and.push({ governingBody: filters.governingBody as GoverningBody });
  if (filters.deadlineFrom) and.push({ deadline: { gte: new Date(filters.deadlineFrom) } });
  if (filters.deadlineTo) and.push({ deadline: { lte: new Date(filters.deadlineTo) } });
  if (filters.budgetMin) and.push({ budget: { gte: Number(filters.budgetMin) } });
  if (filters.budgetMax) and.push({ budget: { lte: Number(filters.budgetMax) } });

  if (filters.view === "overdue") {
    and.push({
      deadline: { lt: new Date() },
      status: { notIn: NON_OVERDUE_STATUSES },
    });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

export function buildProjectOrderBy(sort: string): Prisma.ProjectOrderByWithRelationInput {
  const [field, direction] = sort.split(":");
  const dir = direction === "asc" ? "asc" : "desc";
  if (field === "deadline") return { deadline: dir };
  if (field === "budget") return { budget: dir };
  if (field === "name") return { name: dir };
  return { createdAt: dir };
}

export async function getProjectListPage(filters: ProjectFilters) {
  const where = buildProjectWhere(filters);
  const orderBy = buildProjectOrderBy(filters.sort);
  const page = Math.max(1, Number(filters.page) || 1);

  const [projects, totalItems] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, totalItems, page, totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)) };
}
