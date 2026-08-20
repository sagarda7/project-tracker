"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ContractorSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const debouncedNavigate = useDebouncedCallback((q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }, 300);

  return (
    <div className="max-w-sm">
      <SearchInput
        value={value}
        onChange={(v) => {
          setValue(v);
          debouncedNavigate(v);
        }}
        placeholder={t("common.search")}
      />
    </div>
  );
}
