import { NextResponse } from "next/server";

import { PostbackAuthError, processOfferwallPostback, requireTrustedPostback } from "@/lib/server/postbacks";

export const runtime = "nodejs";

const PROVIDER = "AdGem";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    requireTrustedPostback(searchParams);

    const userId = searchParams.get("player_id");
    const amount = Number(searchParams.get("amount"));
    const offerId = searchParams.get("offer_id");
    const ip = searchParams.get("ip");

    if (!userId || !offerId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Missing or invalid parameters." }, { status: 400 });
    }

    await processOfferwallPostback({
      provider: PROVIDER,
      userId,
      amount,
      offerId,
      ip,
    });

    return new NextResponse("1", { status: 200 });
  } catch (error) {
    if (error instanceof PostbackAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Postback error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
