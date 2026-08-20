import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "settings.title")}</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          {translate(dict, "settings.importExport")}
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Import projects and contractors from CSV files, or export existing records.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/settings/import"
            className="flex items-center gap-3 rounded-md border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <Upload className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900">{translate(dict, "common.import")}</p>
              <p className="text-xs text-gray-500">Import projects or contractors from CSV</p>
            </div>
          </Link>

          <a
            href="/api/export/projects"
            className="flex items-center gap-3 rounded-md border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <Download className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900">{translate(dict, "settings.exportProjects")}</p>
              <p className="text-xs text-gray-500">Download all projects as CSV</p>
            </div>
          </a>

          <a
            href="/api/export/contractors"
            className="flex items-center gap-3 rounded-md border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <Download className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900">{translate(dict, "settings.exportContractors")}</p>
              <p className="text-xs text-gray-500">Download all contractors as CSV</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
