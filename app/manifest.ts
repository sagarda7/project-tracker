import type { MetadataRoute } from "next";

// Special Next.js file convention — must live at the app root (Next only supports it there,
// so this manifest technically applies to every route, not just the public site). What
// actually makes the PUBLIC pages the installable part in practice is start_url below
// (always lands on the public homepage) plus the service worker only being registered from
// app/(public)/layout.tsx — see components/public/pwa-register.tsx.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "राष्ट्रिय स्वतन्त्र पार्टी, चितवन — Project Tracker & Gunaso Pranali",
    short_name: "RSP चितवन",
    description: "गुनासो अनलाइन दर्ता गर्नुहोस् र ट्र्याकिङ कोडको माध्यमबाट यसको प्रगति हेर्नुहोस्।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F3FBFF",
    theme_color: "#0094DA",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
