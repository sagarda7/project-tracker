import { FolderKanban, Clock, Activity, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusChart } from "@/components/dashboard/status-chart";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { ProjectMiniList } from "@/components/dashboard/project-mini-list";

export default async function DashboardPage() {
  const [data, locale] = await Promise.all([getDashboardData(), getLocale()]);
  const dict = getDictionary(locale);

  const statusChartData = data.statusCounts.map((s) => ({
    label: translate(dict, `status.${s.status}`),
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "dashboard.title")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={FolderKanban} label={translate(dict, "dashboard.totalProjects")} value={data.totalProjects} href="/projects" />
        <StatCard icon={Clock} label={translate(dict, "dashboard.plannedProjects")} value={data.plannedCount} accent="gray" href="/projects?status=PLANNED" />
        <StatCard icon={Activity} label={translate(dict, "dashboard.activeProjects")} value={data.activeCount} accent="primary" href="/projects?status=PROGRESS" />
        <StatCard icon={AlertTriangle} label={translate(dict, "dashboard.overdueProjects")} value={data.overdueCount} accent="amber" href="/projects?view=overdue" />
        <StatCard icon={CheckCircle2} label={translate(dict, "dashboard.completedProjects")} value={data.completedCount} accent="green" href="/projects?status=COMPLETED" />
        <StatCard icon={Wallet} label={translate(dict, "dashboard.totalBudget")} value={formatCurrency(data.totalBudget)} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "dashboard.byStatus")}</h2>
          <StatusChart data={statusChartData} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "dashboard.monthlyCreated")}</h2>
          <MonthlyChart data={data.monthly} />
        </div>
      </div>

      {data.overdueProjects.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {translate(dict, "dashboard.overdueAlerts")}
          </h2>
          <ProjectMiniList
            projects={data.overdueProjects}
            locale={locale}
            emptyLabel={translate(dict, "dashboard.noOverdue")}
            variant="danger"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "dashboard.recentlyUpdated")}</h2>
          <ProjectMiniList
            projects={data.recentlyUpdated}
            locale={locale}
            emptyLabel={translate(dict, "dashboard.noRecent")}
            dateField="updatedAt"
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "dashboard.upcomingDeadlines")}</h2>
          <ProjectMiniList
            projects={data.upcomingDeadlines}
            locale={locale}
            emptyLabel={translate(dict, "dashboard.noUpcoming")}
          />
        </div>
      </div>
    </div>
  );
}
