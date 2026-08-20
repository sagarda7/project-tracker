import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  const [contractors, locale] = await Promise.all([
    prisma.contractor.findMany({
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    getLocale(),
  ]);
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "projects.newProject")}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProjectForm contractors={contractors} />
      </div>
    </div>
  );
}
