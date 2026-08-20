"use client";

import { createContext, useContext, useMemo } from "react";
import { Dictionary, translate, TranslationKey } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (key: TranslationKey | string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, dict, t: (key) => translate(dict, key) }),
    [locale, dict]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

export function useTranslations() {
  return useI18n().t;
}
