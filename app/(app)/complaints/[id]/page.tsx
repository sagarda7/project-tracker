import { notFound } from "next/navigation";
import { Phone, User as UserIcon, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/utils";
import { ComplaintStatusBadge } from "@/components/ui/complaint-status-badge";
import { ComplaintStatusUpdate } from "@/components/complaints/complaint-status-update";
import { ComplaintStatusHistory } from "@/components/complaints/complaint-status-history";
import { ComplaintNotes } from "@/components/complaints/complaint-notes";
import { ComplaintAttachments } from "@/components/complaints/complaint-attachments";

export default async function ComplaintDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [complaint, locale] = await Promise.all([
    prisma.complaint.findUnique({
      where: { id },
      include: {
        attachments: { orderBy: { createdAt: "asc" } },
        notes: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { fullName: true } } } },
        statusHistory: { orderBy: { changedAt: "desc" }, include: { changedBy: { select: { fullName: true } } } },
      },
    }),
    getLocale(),
  ]);
  if (!complaint) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">{complaint.name}</h1>
            <ComplaintStatusBadge status={complaint.status} label={translate(dict, `complaintStatus.${complaint.status}`)} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <span className="font-mono font-medium text-gray-700">{complaint.trackingCode}</span>
            &middot; {formatDate(complaint.createdAt)}
          </p>
        </div>
        <ComplaintStatusUpdate complaintId={complaint.id} currentStatus={complaint.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "complaints.description")}</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{complaint.description}</p>
          </div>

          {complaint.attachments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "complaints.attachments")}</h2>
              <ComplaintAttachments attachments={complaint.attachments} />
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <ComplaintNotes complaintId={complaint.id} notes={complaint.notes} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "projects.statusHistory")}</h2>
            <ComplaintStatusHistory history={complaint.statusHistory} locale={locale} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">{translate(dict, "complaints.address")}</h2>
            <InfoRow icon={UserIcon} label={translate(dict, "complaints.complainantName")} value={complaint.name} />
            {complaint.phone && <InfoRow icon={Phone} label={translate(dict, "common.phone")} value={complaint.phone} />}
            <InfoRow
              icon={MapPin}
              label={translate(dict, "projects.location")}
              value={`${complaint.addressDetail ? complaint.addressDetail + ", " : ""}${complaint.municipality}, Ward ${complaint.ward}, ${complaint.district}, ${complaint.province}`}
            />
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-6 text-xs text-gray-500">
            <h2 className="text-sm font-semibold text-gray-900">{translate(dict, "projects.auditInfo")}</h2>
            <p>
              {translate(dict, "projects.createdAt")}: {formatDate(complaint.createdAt)}
            </p>
            <p>
              {translate(dict, "projects.updatedAt")}: {formatDate(complaint.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
