"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AppShell({
  role,
  name,
  email,
  children,
}: {
  role: "ADMIN" | "USER";
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="relative z-50">
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-md bg-white p-1.5 text-gray-500 shadow"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-200" />
            <ProfileMenu name={name} email={email} />
          </div>
        </header>
        <main className="flex-1 bg-gray-50 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
