import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { LogoutButton } from "@/components/profile/logout-button";
import { RoleBadge } from "@/components/ui/status-badge";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, locale] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    getLocale(),
  ]);
  if (!user) redirect("/login");
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{translate(dict, "profile.title")}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span>{user.email}</span>
            <RoleBadge role={user.role} label={user.role} />
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} language={user.language} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">{translate(dict, "profile.changePassword")}</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
