import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { backfillReferralCodesServer } from "@/lib/server/referrals";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireServerAdmin(request);

    const count = await backfillReferralCodesServer();

    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Referral backfill route error:", error);
    return NextResponse.json({ error: "Failed to backfill referral codes." }, { status: 500 });
  }
}
