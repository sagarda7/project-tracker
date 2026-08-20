"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import { projectSchema, ProjectFormValues } from "@/lib/validations/project";
import { createProjectAction, updateProjectAction } from "@/lib/actions/projects";
import { PROJECT_STATUSES, GOVERNING_BODIES } from "@/lib/constants";
import { formatDateInput } from "@/lib/utils";
import { Input, Label, FieldError, Select, Textarea } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { LocationSelect } from "@/components/projects/location-select";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { useUnsavedChangesWarning } from "@/lib/hooks/use-unsaved-changes-warning";

interface ContractorOption {
  id: string;
  name: string;
  phone: string;
}

export function ProjectForm({
  project,
  contractors,
}: {
  project?: Project;
  contractors: ContractorOption[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [useManualContractor, setUseManualContractor] = useState(
    !!project && !project.contractorId
  );

  const defaultValues: ProjectFormValues = useMemo(
    () =>
      project
        ? {
            name: project.name,
            province: project.province,
            district: project.district,
            municipality: project.municipality,
            ward: project.ward,
            locationDescription: project.locationDescription ?? "",
            contractorId: project.contractorId ?? "",
            contractorName: project.contractorName ?? "",
            contractorPhone: project.contractorPhone ?? "",
            contactPersonName: project.contactPersonName ?? "",
            contactPersonPhone: project.contactPersonPhone ?? "",
            governingBody: project.governingBody,
            status: project.status,
            budget: String(project.budget),
            startDate: formatDateInput(project.startDate),
            deadline: formatDateInput(project.deadline),
            description: project.description ?? "",
          }
        : {
            name: "",
            province: "",
            district: "",
            municipality: "",
            ward: "",
            locationDescription: "",
            contractorId: "",
            contractorName: "",
            contractorPhone: "",
            contactPersonName: "",
            contactPersonPhone: "",
            governingBody: "OTHER",
            status: "PLANNED",
            budget: "",
            startDate: "",
            deadline: "",
            description: "",
          },
    [project]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useUnsavedChangesWarning(isDirty && !isSubmitting);

  const province = watch("province");
  const district = watch("district");
  const municipality = watch("municipality");
  const contractorId = watch("contractorId");
  const startDate = watch("startDate");
  const deadline = watch("deadline");

  function handleContractorChange(id: string) {
    setValue("contractorId", id, { shouldDirty: true });
    if (id) {
      const contractor = contractors.find((c) => c.id === id);
      setValue("contractorName", contractor?.name ?? "", { shouldDirty: true });
      setValue("contractorPhone", contractor?.phone ?? "", { shouldDirty: true });
    }
  }

  async function onSubmit(values: ProjectFormValues) {
    setServerError(null);
    const result = project
      ? await updateProjectAction(project.id, values)
      : await createProjectAction(values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    toast(project ? "Project updated" : "Project created");
    router.push(`/projects/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <FormSection title="Basic Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>
              {t("projects.projectName")}
            </Label>
            <Input id="name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="governingBody" required>
              {t("projects.governingBody")}
            </Label>
            <Select id="governingBody" {...register("governingBody")}>
              {GOVERNING_BODIES.map((gb) => (
                <option key={gb} value={gb}>
                  {t(`governingBody.${gb}`)}
                </option>
              ))}
            </Select>
            <FieldError message={errors.governingBody?.message} />
          </div>
          <div>
            <Label htmlFor="status" required>
              {t("common.status")}
            </Label>
            <Select id="status" {...register("status")}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </Select>
            <FieldError message={errors.status?.message} />
          </div>
          <div>
            <Label htmlFor="budget" required>
              {t("common.budget")} (NPR)
            </Label>
            <Input id="budget" type="number" step="0.01" min="0" {...register("budget")} />
            <FieldError message={errors.budget?.message} />
          </div>
        </div>
      </FormSection>

      <FormSection title={t("projects.location")}>
        <div className="space-y-4">
          <LocationSelect
            province={province}
            district={district}
            municipality={municipality}
            onProvinceChange={(v) => {
              setValue("province", v, { shouldDirty: true });
              setValue("district", "", { shouldDirty: true });
              setValue("municipality", "", { shouldDirty: true });
            }}
            onDistrictChange={(v) => {
              setValue("district", v, { shouldDirty: true });
              setValue("municipality", "", { shouldDirty: true });
            }}
            onMunicipalityChange={(v) => setValue("municipality", v, { shouldDirty: true })}
            errors={errors}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ward" required>
                {t("projects.ward")}
              </Label>
              <Input id="ward" {...register("ward")} placeholder="e.g. 5" />
              <FieldError message={errors.ward?.message} />
            </div>
            <div>
              <Label htmlFor="locationDescription">{t("projects.locationDescription")}</Label>
              <Input id="locationDescription" {...register("locationDescription")} />
              <FieldError message={errors.locationDescription?.message} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title={t("projects.contractor")}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="contractorId">{t("projects.contractor")}</Label>
            <Select
              id="contractorId"
              value={useManualContractor ? "" : contractorId}
              disabled={useManualContractor}
              onChange={(e) => handleContractorChange(e.target.value)}
            >
              <option value="">Select a contractor...</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useManualContractor}
                onChange={(e) => {
                  setUseManualContractor(e.target.checked);
                  if (e.target.checked) handleContractorChange("");
                }}
              />
              Enter contractor details manually (not in list)
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contractorName">{t("projects.contractor")}</Label>
              <Input
                id="contractorName"
                disabled={!useManualContractor}
                {...register("contractorName")}
              />
              <FieldError message={errors.contractorName?.message} />
            </div>
            <div>
              <Label htmlFor="contractorPhone">{t("projects.contractorPhone")}</Label>
              <Input
                id="contractorPhone"
                disabled={!useManualContractor}
                {...register("contractorPhone")}
              />
              <FieldError message={errors.contractorPhone?.message} />
            </div>
            <div>
              <Label htmlFor="contactPersonName">{t("projects.contactPersonName")}</Label>
              <Input id="contactPersonName" {...register("contactPersonName")} />
              <FieldError message={errors.contactPersonName?.message} />
            </div>
            <div>
              <Label htmlFor="contactPersonPhone">{t("projects.contactPersonPhone")}</Label>
              <Input id="contactPersonPhone" {...register("contactPersonPhone")} />
              <FieldError message={errors.contactPersonPhone?.message} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Schedule">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startDate">{t("projects.startDate")}</Label>
            <DatePicker
              id="startDate"
              value={startDate ?? ""}
              onChange={(v) => setValue("startDate", v, { shouldDirty: true })}
            />
            <FieldError message={errors.startDate?.message} />
          </div>
          <div>
            <Label htmlFor="deadline">{t("projects.deadline")}</Label>
            <DatePicker
              id="deadline"
              value={deadline ?? ""}
              onChange={(v) => setValue("deadline", v, { shouldDirty: true })}
            />
            <FieldError message={errors.deadline?.message} />
          </div>
        </div>
      </FormSection>

      <FormSection title={t("common.description")}>
        <Textarea id="description" rows={4} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </FormSection>

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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
