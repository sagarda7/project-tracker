import en from "@/messages/en.json";
import ne from "@/messages/ne.json";
import { Locale } from "@/lib/i18n/config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ne };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

type Path<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${Path<T[K]>}` : never }[keyof T]
  : never;

export type TranslationKey = Path<Dictionary>;

export function translate(dict: Dictionary, key: TranslationKey | string): string {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), dict);
  return typeof value === "string" ? value : key;
}
