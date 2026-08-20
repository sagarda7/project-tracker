"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Trash2, ImageOff } from "lucide-react";
import { ProjectImage } from "@prisma/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { deleteProjectImageAction, setMainProjectImageAction } from "@/lib/actions/project-images";
import { publicUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";

export function ImageGallery({ images }: { images: ProjectImage[] }) {
  const [activeId, setActiveId] = useState(images.find((i) => i.isMain)?.id ?? images[0]?.id);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  if (images.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 text-gray-400">
        <ImageOff className="h-8 w-8" />
        <p className="text-sm">No images uploaded yet.</p>
      </div>
    );
  }

  const active = images.find((i) => i.id === activeId) ?? images[0];

  async function handleDelete() {
    if (!pendingDeleteId) return;
    const result = await deleteProjectImageAction(pendingDeleteId);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    toast("Image removed");
    setPendingDeleteId(null);
    router.refresh();
  }

  async function handleSetMain(imageId: string) {
    const result = await setMainProjectImageAction(active.projectId, imageId);
    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-80">
        <Image src={publicUrl(active.filePath)} alt={active.caption ?? "Project image"} fill className="object-cover" />
        {active.isMain && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-primary">
            <Star className="h-3 w-3 fill-primary" /> Main
          </span>
        )}
      </div>
      {active.caption && <p className="text-sm text-gray-600">{active.caption}</p>}

      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative">
            <button
              type="button"
              onClick={() => setActiveId(img.id)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border-2",
                img.id === activeId ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={publicUrl(img.filePath)} alt={img.caption ?? "Project image thumbnail"} fill className="object-cover" />
            </button>
            <div className="absolute -right-1 -top-1 hidden gap-0.5 group-hover:flex">
              {!img.isMain && (
                <button
                  type="button"
                  onClick={() => handleSetMain(img.id)}
                  className="rounded-full bg-white p-1 text-gray-500 shadow hover:text-primary"
                  aria-label="Set as main image"
                  title="Set as main image"
                >
                  <Star className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setPendingDeleteId(img.id)}
                className="rounded-full bg-white p-1 text-gray-500 shadow hover:text-red-600"
                aria-label="Remove image"
                title="Remove image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove this image?"
        message="This image will be permanently removed from the project."
        confirmLabel="Remove"
      />
    </div>
  );
}
