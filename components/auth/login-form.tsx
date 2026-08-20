"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/i18n-provider";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(t("auth.invalidCredentials"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}
      <div>
        <Label htmlFor="email" required>
          {t("auth.email")}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password" required>
          {t("auth.password")}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" loading={isSubmitting}>
        {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  );
}
