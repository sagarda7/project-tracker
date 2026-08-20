"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { profileUpdateSchema, ProfileUpdateFormValues } from "@/lib/validations/user";
import { updateProfileAction } from "@/lib/actions/profile";
import { Input, Label, FieldError, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ProfileForm({
  fullName,
  phone,
  language,
}: {
  fullName: string;
  phone: string;
  language: "EN" | "NE";
}) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { fullName, phone, language },
  });

  async function onSubmit(values: ProfileUpdateFormValues) {
    setServerError(null);
    const result = await updateProfileAction(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div>
        <Label htmlFor="fullName" required>
          {t("users.fullName")}
        </Label>
        <Input id="fullName" {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div>
        <Label htmlFor="phone">{t("common.phone")}</Label>
        <Input id="phone" {...register("phone")} />
        <FieldError message={errors.phone?.message} />
      </div>
      <div>
        <Label htmlFor="language" required>
          {t("users.language")}
        </Label>
        <Select id="language" {...register("language")}>
          <option value="EN">English</option>
          <option value="NE">नेपाली</option>
        </Select>
      </div>
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("profile.updateProfile")}
        </Button>
      </div>
    </form>
  );
}
