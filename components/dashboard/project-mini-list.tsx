import Link from "next/link";
import { Project } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

export function ProjectMiniList({
  projects,
  locale,
  emptyLabel,
  dateField = "deadline",
  variant = "default",
}: {
  projects: Project[];
  locale: Locale;
  emptyLabel: string;
  dateField?: "deadline" | "updatedAt";
  variant?: "default" | "danger";
}) {
  const dict = getDictionary(locale);

  if (projects.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {projects.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <Link
              href={`/projects/${p.id}`}
              className={`truncate text-sm font-medium hover:text-primary ${
                variant === "danger" ? "text-red-700" : "text-gray-900"
              }`}
            >
              {p.name}
            </Link>
            <p className="truncate text-xs text-gray-500">
              {p.municipality}, {p.district} &middot;{" "}
              {formatDate(dateField === "deadline" ? p.deadline : p.updatedAt)}
            </p>
          </div>
          <StatusBadge status={p.status} label={translate(dict, `status.${p.status}`)} />
        </li>
      ))}
    </ul>
  );
}
