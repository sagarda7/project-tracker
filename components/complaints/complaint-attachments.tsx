"use client";

import { FileText } from "lucide-react";
import { ComplaintAttachment } from "@prisma/client";
import { publicUrl } from "@/lib/storage-url";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ComplaintAttachments({ attachments }: { attachments: ComplaintAttachment[] }) {
  const photos = attachments.filter((a) => a.kind === "PHOTO");
  const documents = attachments.filter((a) => a.kind === "DOCUMENT");

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div>
          <AttachmentsLabel labelKey="complaints.photos" />
          <div className="mt-2 flex flex-wrap gap-3">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={publicUrl(photo.filePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-24 w-24 overflow-hidden rounded-md border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={publicUrl(photo.filePath)} alt={photo.fileName} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div>
          <AttachmentsLabel labelKey="complaints.documents" />
          <ul className="mt-2 space-y-1">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={publicUrl(doc.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate">{doc.fileName}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AttachmentsLabel({ labelKey }: { labelKey: "complaints.photos" | "complaints.documents" }) {
  const t = useTranslations();
  return <p className="text-xs font-medium text-gray-500">{t(labelKey)}</p>;
}
