/** Pure helper with no Node.js dependencies — safe to import from Client Components,
 * unlike lib/storage.ts which touches the filesystem.
 * `key` is either a relative "folder/file" path from LocalStorageProvider (old records,
 * and current ones on local dev / Docker) or an already-absolute Vercel Blob URL (current
 * records when deployed on Vercel) — see lib/storage.ts. Blob uploads are stored with
 * access: "private", so the blob's own URL 403s directly; it has to go through
 * app/api/uploads, which streams it back using an authenticated request. */
export function publicUrl(key: string): string {
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return `/api/uploads?src=${encodeURIComponent(key)}`;
  }
  return `/uploads/${key}`;
}
