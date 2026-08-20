"use client";

import { useEffect } from "react";

/** Warns on tab close/refresh when there are unsaved changes. App Router has no built-in
 * navigation-blocking API, so in-app navigation (Cancel buttons, sidebar links) should
 * additionally guard with `window.confirm` before calling router methods. */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);
}
