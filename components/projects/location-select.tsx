"use client";

import { Select, Label, FieldError } from "@/components/ui/input";
import { getProvinceNames, getDistrictsForProvince, getMunicipalitiesForDistrict } from "@/lib/locations";
import { useTranslations } from "@/components/providers/i18n-provider";

export function LocationSelect({
  province,
  district,
  municipality,
  onProvinceChange,
  onDistrictChange,
  onMunicipalityChange,
  errors,
}: {
  province: string;
  district: string;
  municipality: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onMunicipalityChange: (value: string) => void;
  errors: {
    province?: { message?: string };
    district?: { message?: string };
    municipality?: { message?: string };
  };
}) {
  const t = useTranslations();
  const provinces = getProvinceNames();
  const districts = province ? getDistrictsForProvince(province) : [];
  const municipalities = province && district ? getMunicipalitiesForDistrict(province, district) : [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="province" required>
          {t("projects.province")}
        </Label>
        <Select id="province" value={province} onChange={(e) => onProvinceChange(e.target.value)}>
          <option value="">{t("projects.province")}...</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <FieldError message={errors.province?.message} />
      </div>

      <div>
        <Label htmlFor="district" required>
          {t("projects.district")}
        </Label>
        <Select
          id="district"
          value={district}
          disabled={!province}
          onChange={(e) => onDistrictChange(e.target.value)}
        >
          <option value="">{t("projects.district")}...</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <FieldError message={errors.district?.message} />
      </div>

      <div>
        <Label htmlFor="municipality" required>
          {t("projects.municipality")}
        </Label>
        <Select
          id="municipality"
          value={municipality}
          disabled={!district}
          onChange={(e) => onMunicipalityChange(e.target.value)}
        >
          <option value="">{t("projects.municipality")}...</option>
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <FieldError message={errors.municipality?.message} />
      </div>
    </div>
  );
}
