import { NextResponse } from "next/server";

import { RequestAuthError, requireServerUser } from "@/lib/server/auth";
import { JobApplicationActionError, markThreadRead } from "@/lib/server/jobApplications";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { uid } = await requireServerUser(request);
    const { threadId } = await params;

    const result = await markThreadRead(threadId, uid);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError || error instanceof JobApplicationActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Message read route error:", error);
    return NextResponse.json({ error: "Could not mark conversation read." }, { status: 500 });
  }
}
