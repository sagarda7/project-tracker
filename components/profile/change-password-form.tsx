"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordFormValues } from "@/lib/validations/user";
import { changePasswordAction } from "@/lib/actions/profile";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ChangePasswordForm() {
  const t = useTranslations();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null);
    const result = await changePasswordAction(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("Password changed successfully");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div>
        <Label htmlFor="currentPassword" required>
          {t("profile.currentPassword")}
        </Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div>
        <Label htmlFor="newPassword" required>
          {t("profile.newPassword")}
        </Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        <FieldError message={errors.newPassword?.message} />
      </div>
      <div>
        <Label htmlFor="confirmPassword" required>
          {t("profile.confirmPassword")}
        </Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("profile.changePassword")}
        </Button>
      </div>
    </form>
  );
}
