"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { ProjectFollowupNote } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FollowupNoteForm } from "@/components/followup/followup-note-form";
import { deleteFollowupNoteAction } from "@/lib/actions/followup-notes";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/utils";
import { publicUrl } from "@/lib/storage-url";

type NoteWithAuthor = ProjectFollowupNote & { createdBy: { fullName: string } };

export function FollowupTimeline({ projectId, notes }: { projectId: string; notes: NoteWithAuthor[] }) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithAuthor | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditingNote(undefined);
    setFormOpen(true);
  }

  function openEdit(note: NoteWithAuthor) {
    setEditingNote(note);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteFollowupNoteAction(deletingId);
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
        <h2 className="text-sm font-semibold text-gray-900">{t("followup.title")}</h2>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("followup.addNote")}
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState title={t("followup.noNotes")} />
      ) : (
        <ol className="relative space-y-6 border-l border-gray-200 pl-6">
          {notes.map((note) => (
            <li key={note.id} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary" />
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {formatDate(note.followupDate ?? note.createdAt)} &middot; {note.createdBy.fullName}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{note.note}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(note)}
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

                {note.proofImagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicUrl(note.proofImagePath)}
                    alt="Proof"
                    className="mt-3 h-24 w-24 rounded-md object-cover"
                  />
                )}

                {note.externalLink && (
                  <a
                    href={note.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("followup.openLink")}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      <FollowupNoteForm
        projectId={projectId}
        note={editingNote}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title={t("followup.deleteConfirmTitle")}
        message={t("followup.deleteConfirmMessage")}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}
