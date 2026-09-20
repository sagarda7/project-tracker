import { ComplaintStatus } from "@prisma/client";
import { ComplaintStatusBadge } from "@/components/ui/complaint-status-badge";
import { formatDate } from "@/lib/utils";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

interface HistoryEntry {
  id: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  comment: string | null;
  changedAt: Date;
  changedBy: { fullName: string };
}

export function ComplaintStatusHistory({ history, locale }: { history: HistoryEntry[]; locale: Locale }) {
  const dict = getDictionary(locale);

  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0">
          <div className="flex items-center gap-2 text-sm">
            {entry.previousStatus && (
              <>
                <ComplaintStatusBadge status={entry.previousStatus} label={translate(dict, `complaintStatus.${entry.previousStatus}`)} />
                <span className="text-gray-400">&rarr;</span>
              </>
            )}
            <ComplaintStatusBadge status={entry.newStatus} label={translate(dict, `complaintStatus.${entry.newStatus}`)} />
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>{formatDate(entry.changedAt)}</p>
            <p>{entry.changedBy.fullName}</p>
          </div>
          {entry.comment && <p className="w-full text-xs text-gray-500">{entry.comment}</p>}
        </div>
      ))}
    </div>
  );
}
