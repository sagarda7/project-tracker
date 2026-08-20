"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validations/user";
import { resetPasswordAction } from "@/lib/actions/users";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { z } from "zod";

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await resetPasswordAction(userId, values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("Password reset successfully");
    reset();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label={t("users.resetPassword")}
        title={t("users.resetPassword")}
      >
        <KeyRound className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("users.resetPassword")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <div>
            <Label htmlFor="password" required>
              {t("users.newPassword")}
            </Label>
            <Input id="password" type="password" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t("common.confirm")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
