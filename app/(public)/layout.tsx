import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "राष्ट्रिय स्वतन्त्र पार्टी, चितवन",
  description: "गुनासो अनलाइन दर्ता गर्नुहोस् र ट्र्याकिङ कोडको माध्यमबाट यसको प्रगति हेर्नुहोस्।",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
