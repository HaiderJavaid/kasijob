import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { manualLinkUserServer } from "@/lib/server/referrals";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireServerAdmin(request);

    const { childEmail, parentCode } = await request.json();

    if (!childEmail || !parentCode) {
      return NextResponse.json({ error: "Missing link fields." }, { status: 400 });
    }

    await manualLinkUserServer(childEmail, parentCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to link user.";
    const status = message === "Child email not found" || message === "Parent code not found" || message === "Cannot link to self"
      ? 400
      : 500;

    console.error("Referral link route error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
