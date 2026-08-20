import { HardHat } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HardHat className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-semibold text-gray-900">
            {translate(dict, "auth.loginTitle")}
          </h1>
          <p className="text-sm text-gray-500">{translate(dict, "auth.loginSubtitle")}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <LoginForm callbackUrl={callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard"} />
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          Admin: admin@example.com / admin123 &middot; User: user@example.com / user123
        </p>
      </div>
    </div>
  );
}
