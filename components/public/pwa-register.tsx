"use client";

import { useEffect } from "react";

// Only rendered from app/(public)/layout.tsx — this is what actually scopes "installable" to
// the public site, since Next's manifest.ts file convention itself can only live at the app
// root (see app/manifest.ts) and can't be restricted to one route group.
export function PwaRegister() {
  useEffect(() => {
    // Skip in dev: Turbopack rebuilds assets on every change, and a service worker caching
    // them would serve stale JS/CSS while iterating locally.
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability just degrades gracefully without a service worker — nothing to show the user.
    });
  }, []);

  return null;
}
