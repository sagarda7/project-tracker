import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Mail, Phone, MapPin, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContractorDeleteButton } from "@/components/contractors/contractor-delete-button";

export default async function ContractorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contractor, session, locale] = await Promise.all([
    prisma.contractor.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    auth(),
    getLocale(),
  ]);
  if (!contractor) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{contractor.name}</h1>
          {contractor.companyName && <p className="text-sm text-gray-500">{contractor.companyName}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/contractors/${contractor.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            {translate(dict, "common.edit")}
          </Link>
          {session?.user.role === "ADMIN" && <ContractorDeleteButton id={contractor.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <InfoRow icon={Phone} label={translate(dict, "common.phone")} value={contractor.phone} />
        {contractor.alternatePhone && (
          <InfoRow icon={Phone} label={translate(dict, "contractors.alternatePhone")} value={contractor.alternatePhone} />
        )}
        {contractor.email && <InfoRow icon={Mail} label={translate(dict, "common.email")} value={contractor.email} />}
        {contractor.contactPerson && (
          <InfoRow icon={UserIcon} label={translate(dict, "contractors.contactPerson")} value={contractor.contactPerson} />
        )}
        {contractor.address && (
          <InfoRow icon={MapPin} label={translate(dict, "contractors.address")} value={contractor.address} />
        )}
      </div>

      {contractor.notes && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">{translate(dict, "common.notes")}</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{contractor.notes}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "projects.title")}</h2>
        {contractor.projects.length === 0 ? (
          <p className="text-sm text-gray-500">{translate(dict, "projects.noProjects")}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {contractor.projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link href={`/projects/${project.id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                    {project.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {project.municipality}, {project.district} &middot; {formatDate(project.deadline)}
                  </p>
                </div>
                <StatusBadge status={project.status} label={translate(dict, `status.${project.status}`)} />
              </li>
            ))}
          </ul>
        )}
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
