"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useTranslations } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function Sidebar({ role, onNavigate }: { role: "ADMIN" | "USER"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <HardHat className="h-6 w-6 text-primary" />
        <span className="text-base font-semibold text-gray-900">Project Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN").map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
