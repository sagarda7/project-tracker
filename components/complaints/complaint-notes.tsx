"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ComplaintNote } from "@prisma/client";
import { complaintNoteSchema, ComplaintNoteFormValues } from "@/lib/validations/complaint";
import {
  createComplaintNoteAction,
  updateComplaintNoteAction,
  deleteComplaintNoteAction,
} from "@/lib/actions/complaints";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea, FieldError } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/utils";

type NoteWithAuthor = ComplaintNote & { createdBy: { fullName: string } };

export function ComplaintNotes({ complaintId, notes }: { complaintId: string; notes: NoteWithAuthor[] }) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithAuthor | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteComplaintNoteAction(deletingId);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast("Note deleted");
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{t("complaints.notes")}</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingNote(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("complaints.addNote")}
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState title={t("complaints.noNotes")} />
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">
                    {formatDate(note.createdAt)} &middot; {note.createdBy.fullName}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{note.note}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(note);
                      setFormOpen(true);
                    }}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(note.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ComplaintNoteForm
        complaintId={complaintId}
        note={editingNote}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete this note?"
        message="This complaint note will be permanently removed."
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}

function ComplaintNoteForm({
  complaintId,
  note,
  open,
  onClose,
}: {
  complaintId: string;
  note?: NoteWithAuthor;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintNoteFormValues>({
    resolver: zodResolver(complaintNoteSchema),
    values: { note: note?.note ?? "" },
  });

  async function onSubmit(values: ComplaintNoteFormValues) {
    setServerError(null);
    const result = note
      ? await updateComplaintNoteAction(note.id, values)
      : await createComplaintNoteAction(complaintId, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    toast(note ? "Note updated" : "Note added");
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? t("common.edit") : t("complaints.addNote")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div>
          <Textarea id="note" rows={4} {...register("note")} />
          <FieldError message={errors.note?.message} />
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
