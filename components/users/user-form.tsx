"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import {
  createUserSchema,
  CreateUserFormValues,
  updateUserSchema,
  UpdateUserFormValues,
} from "@/lib/validations/user";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import { ROLES, LANGUAGES } from "@/lib/constants";
import { Input, Label, FieldError, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";

export function UserForm({ user }: { user?: User }) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  if (user) {
    return <EditUserForm user={user} t={t} router={router} toast={toast} serverError={serverError} setServerError={setServerError} />;
  }
  return <CreateUserForm t={t} router={router} toast={toast} serverError={serverError} setServerError={setServerError} />;
}

type SharedProps = {
  t: ReturnType<typeof useTranslations>;
  router: ReturnType<typeof useRouter>;
  toast: ReturnType<typeof useToast>["toast"];
  serverError: string | null;
  setServerError: (v: string | null) => void;
};

function CreateUserForm({ t, router, toast, serverError, setServerError }: SharedProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", role: "USER", language: "EN" },
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);

  async function onSubmit(values: CreateUserFormValues) {
    setServerError(null);
    const result = await createUserAction(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("User created");
    router.push("/users");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <ServerErrorBanner message={serverError} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName" required>
            {t("users.fullName")}
          </Label>
          <Input id="fullName" {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="email" required>
            {t("common.email")}
          </Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="phone">{t("common.phone")}</Label>
          <Input id="phone" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="password" required>
            {t("auth.password")}
          </Label>
          <Input id="password" type="password" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label htmlFor="role" required>
            {t("users.role")}
          </Label>
          <Select id="role" {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="language" required>
            {t("users.language")}
          </Label>
          <Select id="language" {...register("language")}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l === "EN" ? "English" : "नेपाली"}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <FormActions t={t} router={router} isSubmitting={isSubmitting} isDirty={isDirty} />
    </form>
  );
}

function EditUserForm({ user, t, router, toast, serverError, setServerError }: SharedProps & { user: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      language: user.language,
      isActive: user.isActive,
    },
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);

  async function onSubmit(values: UpdateUserFormValues) {
    setServerError(null);
    const result = await updateUserAction(user.id, values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("User updated");
    router.push("/users");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <ServerErrorBanner message={serverError} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName" required>
            {t("users.fullName")}
          </Label>
          <Input id="fullName" {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="email" required>
            {t("common.email")}
          </Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="phone">{t("common.phone")}</Label>
          <Input id="phone" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="role" required>
            {t("users.role")}
          </Label>
          <Select id="role" {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="language" required>
            {t("users.language")}
          </Label>
          <Select id="language" {...register("language")}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l === "EN" ? "English" : "नेपाली"}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("isActive")} />
            {t("common.active")}
          </label>
        </div>
      </div>
      <FormActions t={t} router={router} isSubmitting={isSubmitting} isDirty={isDirty} />
    </form>
  );
}

function ServerErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>
  );
}

function FormActions({
  t,
  router,
  isSubmitting,
  isDirty,
}: {
  t: ReturnType<typeof useTranslations>;
  router: ReturnType<typeof useRouter>;
  isSubmitting: boolean;
  isDirty: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          if (isDirty && !window.confirm(t("common.unsavedChanges"))) return;
          router.back();
        }}
        disabled={isSubmitting}
      >
        {t("common.cancel")}
      </Button>
      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? t("common.saving") : t("common.save")}
      </Button>
    </div>
  );
}
