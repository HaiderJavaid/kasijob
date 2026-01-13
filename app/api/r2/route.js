// app/api/r2/route.js
import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request) {
  try {
    const { filename, fileType, folder } = await request.json();
    
    // Safety: Only allow specific folders
    const validFolder = folder === 'avatars' ? 'avatars' : 'proofs';
    const uniqueKey = `${validFolder}/${Date.now()}_${filename.replace(/\s+/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, fileKey: uniqueKey });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// NEW: This allows the Admin/User to VIEW the private image
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) return NextResponse.json({ error: "No key provided" }, { status: 400 });

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });
        
        // Generate a temporary link to view the image (valid for 1 hour)
        const viewUrl = await getSignedUrl(r2, command, { expiresIn: 86400 });
        
        return NextResponse.json({ viewUrl });
    } catch (error) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
}