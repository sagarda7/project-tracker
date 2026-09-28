import type { Metadata, Viewport } from "next";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { PwaRegister } from "@/components/public/pwa-register";

export const metadata: Metadata = {
  title: "राष्ट्रिय स्वतन्त्र पार्टी, चितवन",
  description: "गुनासो अनलाइन दर्ता गर्नुहोस् र ट्र्याकिङ कोडको माध्यमबाट यसको प्रगति हेर्नुहोस्।",
  appleWebApp: {
    capable: true,
    title: "RSP चितवन",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0094DA",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PwaRegister />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
