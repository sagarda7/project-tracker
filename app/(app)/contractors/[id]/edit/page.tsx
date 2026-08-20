import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { ContractorForm } from "@/components/contractors/contractor-form";

export default async function EditContractorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contractor, locale] = await Promise.all([
    prisma.contractor.findUnique({ where: { id } }),
    getLocale(),
  ]);
  if (!contractor) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "contractors.editContractor")}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ContractorForm contractor={contractor} />
      </div>
    </div>
  );
}
