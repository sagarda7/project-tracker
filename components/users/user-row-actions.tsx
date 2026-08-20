"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Power } from "lucide-react";
import { toggleUserActiveAction, deleteUserAction } from "@/lib/actions/users";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";
import { DeleteAction } from "@/components/ui/delete-action";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";

export function UserRowActions({
  id,
  isActive,
  isSelf,
}: {
  id: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  async function handleToggleActive() {
    const result = await toggleUserActiveAction(id);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast(isActive ? "User deactivated" : "User activated");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/users/${id}/edit`}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label={t("common.edit")}
        title={t("common.edit")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <ResetPasswordDialog userId={id} />
      {!isSelf && (
        <button
          type="button"
          onClick={handleToggleActive}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={isActive ? t("users.deactivate") : t("users.activate")}
          title={isActive ? t("users.deactivate") : t("users.activate")}
        >
          <Power className="h-4 w-4" />
        </button>
      )}
      {!isSelf && (
        <DeleteAction
          onDelete={() => deleteUserAction(id)}
          title={t("users.deleteConfirmTitle")}
          message={t("users.deleteConfirmMessage")}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          onSuccess={() => router.refresh()}
          label={t("common.delete")}
        />
      )}
    </div>
  );
}
