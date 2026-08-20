import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Storage abstraction. `LocalStorageProvider` writes to the local filesystem under
 * `public/uploads`. To move to S3 or another cloud provider, implement `StorageProvider`
 * with the same shape and swap the export of `storage` below — nothing else in the app
 * needs to change, since callers only deal with `{ url, key }`.
 */
export interface SavedFile {
  /** Public URL the file can be served from. */
  url: string;
  /** Storage-provider-specific key/path used to delete the file later. */
  key: string;
}

export interface StorageProvider {
  save(buffer: Buffer, folder: string, originalName: string): Promise<SavedFile>;
  remove(key: string): Promise<void>;
}

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

class LocalStorageProvider implements StorageProvider {
  async save(buffer: Buffer, folder: string, originalName: string): Promise<SavedFile> {
    const ext = path.extname(originalName).toLowerCase() || "";
    const fileName = `${crypto.randomUUID()}${ext}`;
    const dir = path.join(UPLOAD_ROOT, folder);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, buffer);
    const key = `${folder}/${fileName}`;
    return { url: `/uploads/${key}`, key };
  }

  async remove(key: string): Promise<void> {
    try {
      await unlink(path.join(UPLOAD_ROOT, key));
    } catch {
      // File may already be gone — deletion is best-effort.
    }
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
