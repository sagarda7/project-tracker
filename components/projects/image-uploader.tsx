"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload, X } from "lucide-react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "@/components/providers/i18n-provider";
import { addProjectImageAction } from "@/lib/actions/project-images";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

export function ImageUploader({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();

  function reset() {
    setFile(null);
    setPreview(null);
    setCaption("");
    setError(null);
  }

  function handleFileChange(selected: File | null) {
    setError(null);
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setError("Only JPEG, PNG, and WEBP images are allowed.");
      return;
    }
    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Image must be smaller than 5MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select an image.");
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("caption", caption);

    const result = await addProjectImageAction(projectId, formData);
    setUploading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    toast(t("projects.addImage") + " ✓");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <ImagePlus className="h-4 w-4" />
        {t("projects.addImage")}
      </Button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title={t("projects.addImage")}
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {preview ? (
            <div className="relative">
              {/* Local blob preview shown before upload — not a remote image, next/image adds no value here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-48 w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm">Click to select an image (JPEG, PNG, WEBP, max 5MB)</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <div>
            <Label htmlFor="caption">{t("projects.caption")}</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={handleUpload} loading={uploading}>
              {t("common.upload")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
