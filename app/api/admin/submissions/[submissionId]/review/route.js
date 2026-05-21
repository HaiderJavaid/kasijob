import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { reviewTaskSubmission } from "@/lib/server/tasks";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    await requireServerAdmin(request);

    const { submissionId } = await params;
    const { action } = await request.json();

    await reviewTaskSubmission(submissionId, action);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Internal Error";
    const status = message === "Already reviewed." || message === "Submission does not exist." || message === "Invalid review action."
      ? 400
      : 500;

    console.error("Admin review route error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
