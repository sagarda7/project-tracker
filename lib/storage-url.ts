/** Pure helper with no Node.js dependencies — safe to import from Client Components,
 * unlike lib/storage.ts which touches the filesystem. */
export function publicUrl(key: string): string {
  return `/uploads/${key}`;
}
