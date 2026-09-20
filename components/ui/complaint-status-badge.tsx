import { ComplaintStatus } from "@prisma/client";
import { COMPLAINT_STATUS_BADGE_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ComplaintStatusBadge({ status, label }: { status: ComplaintStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        COMPLAINT_STATUS_BADGE_CLASSES[status]
      )}
    >
      {label}
    </span>
  );
}
