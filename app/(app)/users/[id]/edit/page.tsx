import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { UserForm } from "@/components/users/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const [user, locale] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    getLocale(),
  ]);
  if (!user) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "users.editUser")}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <UserForm user={user} />
      </div>
    </div>
  );
}
