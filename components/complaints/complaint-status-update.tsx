"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { ComplaintStatus } from "@prisma/client";
import { complaintStatusUpdateSchema } from "@/lib/validations/complaint";
import { updateComplaintStatusAction } from "@/lib/actions/complaints";
import { COMPLAINT_STATUSES } from "@/lib/constants";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, Label, Textarea, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";

interface StatusFormValues {
  status: string;
  comment?: string;
}

export function ComplaintStatusUpdate({
  complaintId,
  currentStatus,
}: {
  complaintId: string;
  currentStatus: ComplaintStatus;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(complaintStatusUpdateSchema),
    defaultValues: { status: currentStatus, comment: "" },
  });

  async function onSubmit(values: StatusFormValues) {
    setServerError(null);
    const result = await updateComplaintStatusAction(complaintId, values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast("Status updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <RefreshCw className="h-4 w-4" />
        {t("complaints.updateStatus")}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("complaints.updateStatus")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <div>
            <Label htmlFor="status" required>
              {t("common.status")}
            </Label>
            <Select id="status" {...register("status")}>
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`complaintStatus.${s}`)}
                </option>
              ))}
            </Select>
            <FieldError message={errors.status?.message} />
          </div>
          <div>
            <Label htmlFor="comment">{t("complaints.statusComment")}</Label>
            <Textarea id="comment" rows={3} {...register("comment")} />
            <FieldError message={errors.comment?.message} />
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
