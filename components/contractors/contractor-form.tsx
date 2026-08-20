"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Contractor } from "@prisma/client";
import { contractorSchema, ContractorFormValues } from "@/lib/validations/contractor";
import { createContractorAction, updateContractorAction } from "@/lib/actions/contractors";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";

export function ContractorForm({ contractor }: { contractor?: Contractor }) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: contractor
      ? {
          name: contractor.name,
          companyName: contractor.companyName ?? "",
          phone: contractor.phone,
          alternatePhone: contractor.alternatePhone ?? "",
          email: contractor.email ?? "",
          address: contractor.address ?? "",
          contactPerson: contractor.contactPerson ?? "",
          notes: contractor.notes ?? "",
        }
      : { name: "", phone: "" },
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);

  async function onSubmit(values: ContractorFormValues) {
    setServerError(null);
    const result = contractor
      ? await updateContractorAction(contractor.id, values)
      : await createContractorAction(values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    toast(contractor ? "Contractor updated" : "Contractor created");
    router.push(`/contractors/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            {t("contractors.contractorName")}
          </Label>
          <Input id="name" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="companyName">{t("contractors.companyName")}</Label>
          <Input id="companyName" {...register("companyName")} />
          <FieldError message={errors.companyName?.message} />
        </div>
        <div>
          <Label htmlFor="phone" required>
            {t("common.phone")}
          </Label>
          <Input id="phone" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="alternatePhone">{t("contractors.alternatePhone")}</Label>
          <Input id="alternatePhone" {...register("alternatePhone")} />
          <FieldError message={errors.alternatePhone?.message} />
        </div>
        <div>
          <Label htmlFor="email">{t("common.email")}</Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="contactPerson">{t("contractors.contactPerson")}</Label>
          <Input id="contactPerson" {...register("contactPerson")} />
          <FieldError message={errors.contactPerson?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">{t("contractors.address")}</Label>
          <Input id="address" {...register("address")} />
          <FieldError message={errors.address?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">{t("common.notes")}</Label>
          <Textarea id="notes" {...register("notes")} />
          <FieldError message={errors.notes?.message} />
        </div>
      </div>

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
    </form>
  );
}
