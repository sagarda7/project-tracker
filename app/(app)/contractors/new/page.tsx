import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { ContractorForm } from "@/components/contractors/contractor-form";

export default async function NewContractorPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "contractors.newContractor")}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ContractorForm />
      </div>
    </div>
  );
}
