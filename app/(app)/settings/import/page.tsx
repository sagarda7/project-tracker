import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { CsvImportPanel } from "@/components/settings/csv-import-panel";
import { importProjectsCsvAction, importContractorsCsvAction } from "@/lib/actions/csv-import";

export default async function SettingsImportPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "settings.importExport")}</h1>

      <CsvImportPanel
        title={translate(dict, "settings.importProjects")}
        templateUrl="/samples/projects-template.csv"
        entityType="project"
        onImport={importProjectsCsvAction}
      />

      <CsvImportPanel
        title={translate(dict, "settings.importContractors")}
        templateUrl="/samples/contractors-template.csv"
        entityType="contractor"
        onImport={importContractorsCsvAction}
      />
    </div>
  );
}
