import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { generateRetroactiveRewardsServer } from "@/lib/server/payouts";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireServerAdmin(request);

    const result = await generateRetroactiveRewardsServer();

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Referral payout sync route error:", error);
    return NextResponse.json({ error: "Failed to sync referral payouts." }, { status: 500 });
  }
}
