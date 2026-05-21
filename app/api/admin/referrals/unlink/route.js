import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { unlinkUserServer } from "@/lib/server/referrals";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireServerAdmin(request);

    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "Missing unlink field." }, { status: 400 });
    }

    await unlinkUserServer(userEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to unlink user.";
    const status = message === "User not found" ? 400 : 500;

    console.error("Referral unlink route error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
