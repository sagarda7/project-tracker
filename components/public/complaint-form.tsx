"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Check, FileText, ImagePlus, Paperclip, RefreshCw, X } from "lucide-react";
import { complaintSchema, ComplaintFormValues } from "@/lib/validations/complaint";
import { submitComplaintAction, getMathCaptchaAction } from "@/lib/actions/complaints";
import type { MathCaptcha } from "@/lib/captcha";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSelect } from "@/components/projects/location-select";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_DOCUMENT_SIZE_MB,
  MAX_TOTAL_ATTACHMENTS_BYTES,
  MAX_TOTAL_ATTACHMENTS_MB,
} from "@/lib/constants";

export function ComplaintForm({ initialCaptcha }: { initialCaptcha: MathCaptcha }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [captcha, setCaptcha] = useState<MathCaptcha>(initialCaptcha);
  const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      name: "",
      phone: "",
      description: "",
      province: "",
      district: "",
      municipality: "",
      ward: "",
      addressDetail: "",
      captchaAnswer: "",
    },
  });

  async function refreshCaptcha() {
    setRefreshingCaptcha(true);
    const next = await getMathCaptchaAction();
    setCaptcha(next);
    resetField("captchaAnswer");
    setRefreshingCaptcha(false);
  }

  const province = watch("province");
  const district = watch("district");
  const municipality = watch("municipality");

  function totalAttachmentsSize(extra: File[] = []) {
    return [...photos, ...documents, ...extra].reduce((sum, f) => sum + f.size, 0);
  }

  function addPhotos(fileList: FileList | null) {
    setFileError(null);
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" एउटा मान्य तस्बिर फाइल होइन।`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setFileError(`"${file.name}" फाइल साइज धेरै ठूलो छ (अधिकतम ${MAX_IMAGE_SIZE_MB}MB)।`);
        continue;
      }
      if (totalAttachmentsSize([file]) > MAX_TOTAL_ATTACHMENTS_BYTES) {
        setFileError(`सबै संलग्न फाइलहरूको कुल साइज ${MAX_TOTAL_ATTACHMENTS_MB}MB भन्दा बढी हुन सक्दैन।`);
        continue;
      }
      setPhotos((prev) => [...prev, file]);
    }
  }

  function addDocuments(fileList: FileList | null) {
    setFileError(null);
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" एउटा मान्य फाइल होइन।`);
        continue;
      }
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        setFileError(`"${file.name}" फाइल साइज धेरै ठूलो छ (अधिकतम ${MAX_DOCUMENT_SIZE_MB}MB)।`);
        continue;
      }
      if (totalAttachmentsSize([file]) > MAX_TOTAL_ATTACHMENTS_BYTES) {
        setFileError(`सबै संलग्न फाइलहरूको कुल साइज ${MAX_TOTAL_ATTACHMENTS_MB}MB भन्दा बढी हुन सक्दैन।`);
        continue;
      }
      setDocuments((prev) => [...prev, file]);
    }
  }

  async function onSubmit(values: ComplaintFormValues) {
    setServerError(null);

    if (totalAttachmentsSize() > MAX_TOTAL_ATTACHMENTS_BYTES) {
      setFileError(`सबै संलग्न फाइलहरूको कुल साइज ${MAX_TOTAL_ATTACHMENTS_MB}MB भन्दा बढी हुन सक्दैन।`);
      return;
    }

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("phone", values.phone ?? "");
    formData.set("description", values.description);
    formData.set("province", values.province);
    formData.set("district", values.district);
    formData.set("municipality", values.municipality);
    formData.set("ward", values.ward);
    formData.set("addressDetail", values.addressDetail ?? "");
    formData.set("captchaA", String(captcha.a));
    formData.set("captchaB", String(captcha.b));
    formData.set("captchaToken", captcha.token);
    formData.set("captchaAnswer", values.captchaAnswer);
    photos.forEach((file) => formData.append("photos", file));
    documents.forEach((file) => formData.append("documents", file));

    try {
      const result = await submitComplaintAction(formData);
      if (!result.success) {
        setServerError(result.error);
        await refreshCaptcha();
        return;
      }
      setTrackingCode(result.data.trackingCode);
    } catch {
      // The server action call itself can throw (e.g. a request-too-large rejection at
      // the framework level, or a network drop) before our own error handling ever runs.
      setServerError(
        "अपलोड असफल भयो। संलग्न फाइलहरूको कुल साइज घटाएर फेरि प्रयास गर्नुहोस्, वा पछि पुन: प्रयास गर्नुहोस्।"
      );
      await refreshCaptcha();
    }
  }

  if (trackingCode) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center">
        <Check className="mx-auto h-10 w-10 rounded-full bg-green-100 p-2 text-green-600" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">तपाईंको गुनासो सफलतापूर्वक दर्ता भयो</h2>
        <p className="mt-2 text-sm text-gray-600">
          कृपया तलको ट्र्याकिङ कोड सुरक्षित राख्नुहोस्। यो कोडको माध्यमबाट तपाईं आफ्नो गुनासोको प्रगति
          पछि हेर्न सक्नुहुन्छ।
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="rounded-lg border-2 border-dashed border-primary bg-primary/5 px-6 py-3 text-2xl font-bold tracking-[0.3em] text-primary">
            {trackingCode}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(trackingCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-md border border-gray-300 p-3 text-gray-500 hover:bg-gray-50"
            aria-label="कोड कपी गर्नुहोस्"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <a
          href="/gunaso/track"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          गुनासो ट्र्याक गर्नुहोस्
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            पूरा नाम
          </Label>
          <Input id="name" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="phone">फोन नम्बर</Label>
          <Input id="phone" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="description" required>
          गुनासोको विवरण
        </Label>
        <Textarea id="description" rows={5} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="space-y-4">
        <h2 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">ठेगाना</h2>
        <LocationSelect
          province={province}
          district={district}
          municipality={municipality}
          onProvinceChange={(v) => {
            setValue("province", v, { shouldDirty: true });
            setValue("district", "", { shouldDirty: true });
            setValue("municipality", "", { shouldDirty: true });
          }}
          onDistrictChange={(v) => {
            setValue("district", v, { shouldDirty: true });
            setValue("municipality", "", { shouldDirty: true });
          }}
          onMunicipalityChange={(v) => setValue("municipality", v, { shouldDirty: true })}
          errors={errors}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ward" required>
              वडा
            </Label>
            <Input id="ward" {...register("ward")} placeholder="जस्तै: ५" />
            <FieldError message={errors.ward?.message} />
          </div>
          <div>
            <Label htmlFor="addressDetail">थप ठेगाना विवरण</Label>
            <Input id="addressDetail" {...register("addressDetail")} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">प्रमाण संलग्न गर्नुहोस्</h2>
        {fileError && <p className="text-sm text-red-600">{fileError}</p>}

        <div>
          <Label>तस्बिर</Label>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-3 py-4 text-sm text-gray-400 hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
            तस्बिर थप्नुहोस्
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          {photos.length > 0 && (
            <ul className="mt-2 space-y-1">
              {photos.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="हटाउनुहोस्"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label>कागजातहरू</Label>
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-3 py-4 text-sm text-gray-400 hover:border-primary hover:text-primary"
          >
            <Paperclip className="h-5 w-5" />
            कागजात थप्नुहोस् (PDF, Word, तस्बिर)
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept={ALLOWED_DOCUMENT_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              addDocuments(e.target.files);
              e.target.value = "";
            }}
          />
          {documents.length > 0 && (
            <ul className="mt-2 space-y-1">
              {documents.map((file, idx) => (
                <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="हटाउनुहोस्"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">पुष्टिकरण</h2>
        <div>
          <Label htmlFor="captchaAnswer" required>
            {captcha.a} + {captcha.b} = ?
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="captchaAnswer"
              inputMode="numeric"
              className="max-w-35"
              {...register("captchaAnswer")}
            />
            <button
              type="button"
              onClick={refreshCaptcha}
              disabled={refreshingCaptcha}
              className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="नयाँ प्रश्न ल्याउनुहोस्"
              title="नयाँ प्रश्न ल्याउनुहोस्"
            >
              <RefreshCw className={refreshingCaptcha ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </button>
          </div>
          <FieldError message={errors.captchaAnswer?.message} />
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button type="submit" loading={isSubmitting} className="rounded-full px-8">
          {isSubmitting ? "पेश गर्दै..." : "गुनासो पेश गर्नुहोस्"}
        </Button>
      </div>
    </form>
  );
}
