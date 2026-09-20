"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/about", label: "हाम्रो बारे" },
  { href: "/gunaso", label: "गुनासो" },
  { href: "/gunaso/track", label: "गुनासो ट्र्याक" },
  { href: "/contact", label: "सम्पर्क" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-gray-900">गुनासो प्रणाली</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === item.href ? "text-primary" : "text-gray-600 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/gunaso"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            गुनासो दर्ता गर्नुहोस्
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-gray-600">
            स्टाफ लगइन
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="space-y-1 border-t border-gray-200 px-4 py-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/gunaso"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-white"
          >
            गुनासो दर्ता गर्नुहोस्
          </Link>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-gray-400"
          >
            स्टाफ लगइन
          </Link>
        </nav>
      )}
    </header>
  );
}
