import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NON_OVERDUE_STATUSES, PROJECT_STATUSES } from "@/lib/constants";

const ACTIVE_STATUSES: ProjectStatus[] = ["STARTED", "PROGRESS"];

export async function getDashboardData() {
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalProjects,
    plannedCount,
    activeCount,
    completedCount,
    budgetAgg,
    statusGroups,
    overdueProjects,
    overdueCount,
    recentlyUpdated,
    upcomingDeadlines,
    recentProjectDates,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PLANNED" } }),
    prisma.project.count({ where: { status: { in: ACTIVE_STATUSES } } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.project.aggregate({ _sum: { budget: true } }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.project.findMany({
      where: { deadline: { lt: now }, status: { notIn: NON_OVERDUE_STATUSES } },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    prisma.project.count({ where: { deadline: { lt: now }, status: { notIn: NON_OVERDUE_STATUSES } } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.project.findMany({
      where: {
        deadline: { gte: now, lte: in30Days },
        status: { notIn: NON_OVERDUE_STATUSES },
      },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const statusCounts = PROJECT_STATUSES.map((status) => ({
    status,
    count: statusGroups.find((g) => g.status === status)?._count._all ?? 0,
  }));

  const monthly: { month: string; count: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const count = recentProjectDates.filter((p) => {
      const created = new Date(p.createdAt);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    monthly.push({ month: label, count });
  }

  return {
    totalProjects,
    plannedCount,
    activeCount,
    completedCount,
    overdueCount,
    totalBudget: budgetAgg._sum.budget ?? 0,
    statusCounts,
    overdueProjects,
    recentlyUpdated,
    upcomingDeadlines,
    monthly,
  };
}
