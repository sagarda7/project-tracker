import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

/**
 * Storage abstraction. `LocalStorageProvider` writes to the local filesystem under
 * `public/uploads` — this works for local dev and the self-hosted Docker deployments,
 * but NOT on Vercel, whose deployed functions run on a read-only filesystem (there is no
 * writable `public/`, and even /tmp is ephemeral/per-invocation). `VercelBlobStorageProvider`
 * is used instead there. `storage` below picks automatically based on whether
 * BLOB_READ_WRITE_TOKEN is set (Vercel injects this itself once Blob storage is connected
 * to the project — see README).
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

class VercelBlobStorageProvider implements StorageProvider {
  async save(buffer: Buffer, folder: string, originalName: string): Promise<SavedFile> {
    const ext = path.extname(originalName).toLowerCase() || "";
    const fileName = `${crypto.randomUUID()}${ext}`;
    const blob = await put(`${folder}/${fileName}`, buffer, {
      access: "private",
      addRandomSuffix: false,
    });
    // Blob URLs are already absolute and permanent — stored as-is in the DB and returned
    // unchanged by publicUrl() (see lib/storage-url.ts), unlike LocalStorageProvider's
    // relative "folder/file" key.
    return { url: blob.url, key: blob.url };
  }

  async remove(key: string): Promise<void> {
    try {
      await del(key);
    } catch {
      // Blob may already be gone — deletion is best-effort.
    }
  }
}

export const storage: StorageProvider = process.env.BLOB_READ_WRITE_TOKEN
  ? new VercelBlobStorageProvider()
  : new LocalStorageProvider();
