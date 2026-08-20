"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { ActionResult } from "@/lib/action-utils";

export function DeleteAction({
  onDelete,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onSuccess,
  label,
}: {
  onDelete: () => Promise<ActionResult>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onSuccess?: () => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  async function handleConfirm() {
    const result = await onDelete();
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast("Deleted successfully");
    onSuccess?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label={label ?? "Delete"}
        title={label ?? "Delete"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
      />
    </>
  );
}
