import { NextResponse } from "next/server";
import { getFirebaseAdminConfigStatus } from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const adminConfig = getFirebaseAdminConfigStatus();

  return NextResponse.json({
    adminProjectId: adminConfig.projectId,
    hasAdminClientEmail: adminConfig.hasClientEmail,
    hasAdminPrivateKey: adminConfig.hasPrivateKey,
  });
}
