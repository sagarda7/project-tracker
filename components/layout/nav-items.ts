import { LayoutDashboard, FolderKanban, HardHat, Users, Settings } from "lucide-react";
import { TranslationKey } from "@/lib/i18n/dictionaries";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/projects", labelKey: "nav.projects", icon: FolderKanban },
  { href: "/contractors", labelKey: "nav.contractors", icon: HardHat },
  { href: "/users", labelKey: "nav.users", icon: Users, adminOnly: true },
  { href: "/settings", labelKey: "nav.settings", icon: Settings, adminOnly: true },
];
