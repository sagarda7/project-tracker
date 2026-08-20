import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, MapPin, Phone, User as UserIcon, Landmark, Wallet, Calendar, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isOverdue } from "@/lib/constants";
import { StatusBadge, OverdueBadge } from "@/components/ui/status-badge";
import { ImageGallery } from "@/components/projects/image-gallery";
import { ImageUploader } from "@/components/projects/image-uploader";
import { StatusUpdate } from "@/components/projects/status-update";
import { StatusHistory } from "@/components/projects/status-history";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";
import { FollowupTimeline } from "@/components/followup/followup-timeline";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, session, locale] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        images: { orderBy: { createdAt: "asc" } },
        createdBy: { select: { fullName: true } },
        contractor: true,
        followupNotes: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { fullName: true } } },
        },
        statusHistory: {
          orderBy: { changedAt: "desc" },
          include: { changedBy: { select: { fullName: true } } },
        },
      },
    }),
    auth(),
    getLocale(),
  ]);
  if (!project) notFound();
  const dict = getDictionary(locale);
  const overdue = isOverdue(project.deadline, project.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} label={translate(dict, `status.${project.status}`)} />
            {overdue && <OverdueBadge label={translate(dict, "projects.overdue")} />}
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {project.locationDescription ? `${project.locationDescription}, ` : ""}
            {project.municipality}, Ward {project.ward}, {project.district}, {project.province}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusUpdate projectId={project.id} currentStatus={project.status} />
          <Link
            href={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            {translate(dict, "common.edit")}
          </Link>
          {session?.user.role === "ADMIN" && <ProjectDeleteButton id={project.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">{translate(dict, "projects.images")}</h2>
              <ImageUploader projectId={project.id} />
            </div>
            <ImageGallery images={project.images} />
          </div>

          {project.description && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "common.description")}</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-600">{project.description}</p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <FollowupTimeline projectId={project.id} notes={project.followupNotes} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "projects.statusHistory")}</h2>
            <StatusHistory history={project.statusHistory} locale={locale} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <InfoRow icon={Landmark} label={translate(dict, "projects.governingBody")} value={translate(dict, `governingBody.${project.governingBody}`)} />
            <InfoRow icon={Wallet} label={translate(dict, "common.budget")} value={formatCurrency(project.budget)} />
            <InfoRow icon={Calendar} label={translate(dict, "projects.startDate")} value={formatDate(project.startDate)} />
            <InfoRow icon={CalendarClock} label={translate(dict, "projects.deadline")} value={formatDate(project.deadline)} />
          </div>

          {(project.contractorName || project.contactPersonName) && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">{translate(dict, "projects.contractor")}</h2>
              {project.contractorName && (
                <InfoRow icon={UserIcon} label={translate(dict, "projects.contractor")} value={project.contractorName} />
              )}
              {project.contractorPhone && (
                <InfoRow icon={Phone} label={translate(dict, "projects.contractorPhone")} value={project.contractorPhone} />
              )}
              {project.contactPersonName && (
                <InfoRow icon={UserIcon} label={translate(dict, "projects.contactPersonName")} value={project.contactPersonName} />
              )}
              {project.contactPersonPhone && (
                <InfoRow icon={Phone} label={translate(dict, "projects.contactPersonPhone")} value={project.contactPersonPhone} />
              )}
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-6 text-xs text-gray-500">
            <h2 className="text-sm font-semibold text-gray-900">{translate(dict, "projects.auditInfo")}</h2>
            <p>
              {translate(dict, "projects.createdBy")}: {project.createdBy.fullName}
            </p>
            <p>
              {translate(dict, "projects.createdAt")}: {formatDate(project.createdAt)}
            </p>
            <p>
              {translate(dict, "projects.updatedAt")}: {formatDate(project.updatedAt)}
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
