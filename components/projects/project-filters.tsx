"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Select, Label, Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { ProjectFilters, DEFAULT_FILTERS, SORT_OPTIONS } from "@/lib/project-filters";
import { PROJECT_STATUSES, GOVERNING_BODIES } from "@/lib/constants";
import { getProvinceNames, getDistrictsForProvince } from "@/lib/locations";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";
import { useTranslations } from "@/components/providers/i18n-provider";

export function ProjectFilterPanel({ initial }: { initial: ProjectFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [filters, setFilters] = useState(initial);

  function navigate(next: ProjectFilters) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || (key === "view" && value === "all") || (key === "sort" && value === DEFAULT_FILTERS.sort)) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (JSON.stringify(next) !== JSON.stringify(filters)) params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const debouncedNavigate = useDebouncedCallback(navigate, 400);

  function update(patch: Partial<ProjectFilters>, immediate = false) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (immediate) navigate(next);
    else debouncedNavigate(next);
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
    router.push("?");
  }

  const districts = filters.province ? getDistrictsForProvince(filters.province) : [];

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={filters.q}
            onChange={(v) => update({ q: v })}
            placeholder={t("common.search")}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.view === "overdue"}
              onChange={(e) => update({ view: e.target.checked ? "overdue" : "all" }, true)}
            />
            {t("projects.overdueFilter")}
          </label>
          <Button type="button" variant="secondary" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("common.resetFilters")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>{t("common.status")}</Label>
          <Select value={filters.status} onChange={(e) => update({ status: e.target.value }, true)}>
            <option value="">{t("common.all")}</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t("projects.governingBody")}</Label>
          <Select value={filters.governingBody} onChange={(e) => update({ governingBody: e.target.value }, true)}>
            <option value="">{t("common.all")}</option>
            {GOVERNING_BODIES.map((gb) => (
              <option key={gb} value={gb}>
                {t(`governingBody.${gb}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t("projects.province")}</Label>
          <Select
            value={filters.province}
            onChange={(e) => update({ province: e.target.value, district: "" }, true)}
          >
            <option value="">{t("common.all")}</option>
            {getProvinceNames().map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t("projects.district")}</Label>
          <Select
            value={filters.district}
            disabled={!filters.province}
            onChange={(e) => update({ district: e.target.value }, true)}
          >
            <option value="">{t("common.all")}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>{t("projects.deadlineRange")} — {t("common.from")}</Label>
          <DatePicker value={filters.deadlineFrom} onChange={(v) => update({ deadlineFrom: v }, true)} />
        </div>
        <div>
          <Label>{t("projects.deadlineRange")} — {t("common.to")}</Label>
          <DatePicker value={filters.deadlineTo} onChange={(v) => update({ deadlineTo: v }, true)} />
        </div>
        <div>
          <Label>{t("projects.budgetRange")} — {t("common.min")}</Label>
          <Input
            type="number"
            min="0"
            value={filters.budgetMin}
            onChange={(e) => update({ budgetMin: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("projects.budgetRange")} — {t("common.max")}</Label>
          <Input
            type="number"
            min="0"
            value={filters.budgetMax}
            onChange={(e) => update({ budgetMax: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <Label>{t("projects.sortBy")}</Label>
          <Select value={filters.sort} onChange={(e) => update({ sort: e.target.value }, true)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
