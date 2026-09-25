import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/auth";

// Streams private Vercel Blob uploads (project photos, follow-up proof images, complaint
// attachments — see lib/storage.ts) to logged-in dashboard users. Needed because a private
// blob's own URL 403s for a plain <img>/next-image request — only the SDK's authenticated
// get(), using BLOB_READ_WRITE_TOKEN, can read it. publicUrl() (lib/storage-url.ts) points
// here for any stored key that's a Blob URL.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const src = request.nextUrl.searchParams.get("src");
  if (!src || !/^https:\/\/[a-z0-9-]+\.(?:public|private)\.blob\.vercel-storage\.com\//.test(src)) {
    return NextResponse.json({ error: "Invalid src" }, { status: 400 });
  }

  try {
    const blob = await get(src, { access: "private" });
    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
