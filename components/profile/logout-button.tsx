"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/i18n-provider";

export function LogoutButton() {
  const t = useTranslations();
  return (
    <Button type="button" variant="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
      <LogOut className="h-4 w-4" />
      {t("nav.logout")}
    </Button>
  );
}
