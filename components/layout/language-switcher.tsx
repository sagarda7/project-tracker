"use client";

import { useTransition } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { setLanguageAction } from "@/lib/actions/language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "en" | "ne") {
    if (next === locale) return;
    startTransition(() => {
      setLanguageAction(next);
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium" aria-label="Language switcher">
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded px-1.5 py-1 transition-colors",
          locale === "en" ? "text-primary" : "text-gray-500 hover:text-gray-800"
        )}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        type="button"
        onClick={() => switchTo("ne")}
        disabled={isPending}
        aria-pressed={locale === "ne"}
        className={cn(
          "rounded px-1.5 py-1 transition-colors",
          locale === "ne" ? "text-primary" : "text-gray-500 hover:text-gray-800"
        )}
      >
        नेपाली
      </button>
    </div>
  );
}
