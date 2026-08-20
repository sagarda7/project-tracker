"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/lib/actions/projects";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ProjectDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  async function handleConfirm() {
    const result = await deleteProjectAction(id);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast("Project deleted");
    router.push("/projects");
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
        title={t("projects.deleteConfirmTitle")}
        message={t("projects.deleteConfirmMessage")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </>
  );
}
