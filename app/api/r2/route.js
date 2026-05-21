import { NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/server/r2";
import { RequestAuthError, getServerUserRole, requireServerUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["avatars", "proofs"]);
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

function buildObjectKey(folder, uid, filename) {
  return `${folder}/${uid}/${Date.now()}_${sanitizeFilename(filename)}`;
}

function isValidObjectKey(key) {
  return /^avatars\/[^/]+$/.test(key) || /^(avatars|proofs)\/[^/]+\/.+$/.test(key);
}

export async function POST(request) {
  try {
    const { uid } = await requireServerUser(request);
    const { filename, fileType, folder } = await request.json();

    if (!filename || !fileType || !folder) {
      return NextResponse.json({ error: "Missing upload fields." }, { status: 400 });
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(fileType)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const objectKey = buildObjectKey(folder, uid, filename);
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, fileKey: objectKey });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("R2 upload error:", error);
    return NextResponse.json({ error: "Failed to create upload URL." }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "No key provided." }, { status: 400 });
    }

    if (!isValidObjectKey(key)) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const isAvatarKey = key.startsWith("avatars/");

    if (!isAvatarKey) {
      const { uid } = await requireServerUser(request);
      const isOwnedProofKey = key.startsWith(`proofs/${uid}/`);

      if (isOwnedProofKey) {
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        });
        const viewUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

        return NextResponse.json({ viewUrl });
      }

      const role = await getServerUserRole(uid);

      if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const viewUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return NextResponse.json({ viewUrl });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("R2 view error:", error);
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
