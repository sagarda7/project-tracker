import { ProjectStatus } from "@prisma/client";
import { STATUS_BADGE_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_BADGE_CLASSES[status]
      )}
    >
      {label}
    </span>
  );
}

export function OverdueBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap">
      {label}
    </span>
  );
}

export function RoleBadge({ role, label }: { role: "ADMIN" | "USER"; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        role === "ADMIN"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-gray-200 bg-gray-100 text-gray-700"
      )}
    >
      {label}
    </span>
  );
}
