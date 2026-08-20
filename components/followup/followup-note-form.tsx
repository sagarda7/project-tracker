"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { ProjectFollowupNote } from "@prisma/client";
import { followupNoteSchema, FollowupNoteFormValues } from "@/lib/validations/followup";
import { createFollowupNoteAction, updateFollowupNoteAction } from "@/lib/actions/followup-notes";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { publicUrl } from "@/lib/storage-url";

export function FollowupNoteForm({
  projectId,
  note,
  open,
  onClose,
}: {
  projectId: string;
  note?: ProjectFollowupNote;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FollowupNoteFormValues>({
    resolver: zodResolver(followupNoteSchema),
    defaultValues: {
      note: note?.note ?? "",
      followupDate: note?.followupDate ? note.followupDate.toString().slice(0, 10) : "",
      externalLink: note?.externalLink ?? "",
    },
  });

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setFileError("Only JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError("Image must be smaller than 5MB.");
      return;
    }
    setFile(selected);
  }

  async function onSubmit(values: FollowupNoteFormValues) {
    setServerError(null);
    const formData = new FormData();
    formData.set("note", values.note);
    formData.set("followupDate", values.followupDate ?? "");
    formData.set("externalLink", values.externalLink ?? "");
    if (file) formData.set("proofImage", file);
    if (removeExisting) formData.set("removeProofImage", "true");

    const result = note
      ? await updateFollowupNoteAction(note.id, formData)
      : await createFollowupNoteAction(projectId, formData);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    toast(note ? "Note updated" : "Note added");
    reset();
    setFile(null);
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? t("followup.editNote") : t("followup.addNote")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div>
          <Label htmlFor="note" required>
            {t("followup.note")}
          </Label>
          <Textarea id="note" rows={3} {...register("note")} />
          <FieldError message={errors.note?.message} />
        </div>
        <div>
          <Label htmlFor="followupDate">{t("followup.followupDate")}</Label>
          <Input id="followupDate" type="date" {...register("followupDate")} />
          <FieldError message={errors.followupDate?.message} />
        </div>
        <div>
          <Label htmlFor="externalLink">{t("followup.externalLink")}</Label>
          <Input id="externalLink" placeholder="https://..." {...register("externalLink")} />
          <FieldError message={errors.externalLink?.message} />
        </div>
        <div>
          <Label>{t("followup.proofImage")}</Label>
          {fileError && <p className="mb-1 text-sm text-red-600">{fileError}</p>}
          {note?.proofImagePath && !removeExisting && !file && (
            <div className="mb-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(note.proofImagePath)} alt="Existing proof" className="h-16 w-16 rounded object-cover" />
              <button
                type="button"
                onClick={() => setRemoveExisting(true)}
                className="text-sm text-red-600 hover:underline"
              >
                {t("common.remove")}
              </button>
            </div>
          )}
          {file ? (
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
              <span className="flex-1 truncate">{file.name}</span>
              <button type="button" onClick={() => handleFileChange(null)} aria-label="Remove selected file">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-3 py-3 text-sm text-gray-400 hover:border-primary hover:text-primary"
            >
              <Upload className="h-4 w-4" />
              {t("common.upload")}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
