import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/server/r2";
import { RequestAuthError, requireServerUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function sanitizeFilename(filename) {
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleanName.slice(-80) || `upload_${Date.now()}`;
}

export async function POST(request) {
  try {
    const { uid } = await requireServerUser(request);
    const { filename, fileType } = await request.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: "Missing upload fields." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(fileType)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const fileKey = `proofs/${uid}/${Date.now()}_${sanitizeFilename(filename)}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, fileKey });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Legacy upload route error:", error);
    return NextResponse.json({ error: "Failed to create upload URL." }, { status: 500 });
  }
}
