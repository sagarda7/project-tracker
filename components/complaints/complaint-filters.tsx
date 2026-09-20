"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/input";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useTranslations } from "@/components/providers/i18n-provider";
import { COMPLAINT_STATUSES } from "@/lib/constants";

export function ComplaintFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function navigate(nextQ: string, status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    if (status) params.set("status", status);
    else params.delete("status");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const debouncedNavigate = useDebouncedCallback((nextQ: string) => {
    navigate(nextQ, searchParams.get("status") ?? "");
  }, 300);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="max-w-sm flex-1">
        <SearchInput
          value={q}
          onChange={(v) => {
            setQ(v);
            debouncedNavigate(v);
          }}
          placeholder={t("complaints.searchPlaceholder")}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select value={searchParams.get("status") ?? ""} onChange={(e) => navigate(q, e.target.value)}>
          <option value="">{t("common.all")}</option>
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`complaintStatus.${s}`)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
