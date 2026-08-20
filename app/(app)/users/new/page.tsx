import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { UserForm } from "@/components/users/user-form";

export default async function NewUserPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "users.newUser")}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <UserForm />
      </div>
    </div>
  );
}
