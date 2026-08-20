"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { deleteContractorAction } from "@/lib/actions/contractors";
import { DeleteAction } from "@/components/ui/delete-action";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ContractorRowActions({ id, canDelete }: { id: string; canDelete: boolean }) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/contractors/${id}`}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label={t("common.view")}
        title={t("common.view")}
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/contractors/${id}/edit`}
        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label={t("common.edit")}
        title={t("common.edit")}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      {canDelete && (
        <DeleteAction
          onDelete={() => deleteContractorAction(id)}
          title={t("contractors.deleteConfirmTitle")}
          message={t("contractors.deleteConfirmMessage")}
          confirmLabel={t("common.delete")}
          cancelLabel={t("common.cancel")}
          onSuccess={() => router.refresh()}
          label={t("common.delete")}
        />
      )}
    </div>
  );
}
