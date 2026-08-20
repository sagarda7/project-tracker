"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { deleteContractorAction } from "@/lib/actions/contractors";

export function ContractorDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  async function handleConfirm() {
    const result = await deleteContractorAction(id);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast("Contractor deleted");
    router.push("/contractors");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        {t("common.delete")}
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={t("contractors.deleteConfirmTitle")}
        message={t("contractors.deleteConfirmMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </>
  );
}
