"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/about", label: "हाम्रो बारे" },
  { href: "/gunaso", label: "गुनासो" },
  { href: "/gunaso/track", label: "गुनासो ट्र्याक" },
  { href: "/contact", label: "सम्पर्क" },
];

const CONTACT_PHONE = "०१-४०००००१";
const CONTACT_EMAIL = "support@rspchitwan.org";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="hidden bg-[#F3FBFF] sm:block">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-end gap-6 px-4 text-sm text-gray-600 sm:px-6">
          <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-1.5 hover:text-primary">
            <Phone className="h-4 w-4 text-primary" />
            {CONTACT_PHONE}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 hover:text-primary">
            <Mail className="h-4 w-4 text-primary" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/rsp-logo-icon.svg" alt="राष्ट्रिय स्वतन्त्र पार्टी" width={48} height={38} priority />
            <span className="flex flex-col">
              <span className="text-2xl font-bold leading-tight text-gray-900">
                राष्ट्रिय स्वतन्त्र पार्टी, <span className="text-primary">चितवन</span>
              </span>
              <span className="text-xs font-medium text-gray-500">आयोजना ट्र्याकर तथा गुनासो प्रणाली</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-bold transition-colors",
                  pathname === item.href ? "text-primary" : "text-gray-700 hover:text-primary"
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
                  "block rounded-md px-3 py-2 text-base font-bold",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-50"
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
            <div className="mt-2 flex flex-col gap-1.5 border-t border-gray-100 pt-2 text-sm text-gray-600">
              <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" /> {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-primary" /> {CONTACT_EMAIL}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
