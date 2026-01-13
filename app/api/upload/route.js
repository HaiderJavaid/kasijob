import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(request) {
  try {
    // 1. Verify User (Simplified for example)
    // In production, use firebase-admin to verify the 'Authorization' header token here
    
    const { filename, fileType } = await request.json();

    // 2. Generate a unique file name to prevent overwrites
    // e.g., "proofs/user_123/timestamp_filename.jpg"
    const uniqueFileName = `proofs/${Date.now()}_${filename}`;

    // 3. Create the Magic Upload Command
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // 4. Generate the URL (valid for 5 minutes)
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    return NextResponse.json({ 
      uploadUrl: signedUrl, 
      fileKey: uniqueFileName // Store this in your Firestore database!
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}