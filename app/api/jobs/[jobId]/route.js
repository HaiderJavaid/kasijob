import { NextResponse } from "next/server";

import { RequestAuthError, requireServerUser } from "@/lib/server/auth";
import { deletePostedJobForPoster, JobActionError } from "@/lib/server/jobs";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  try {
    const { uid } = await requireServerUser(request);
    const { jobId } = await params;
    const result = await deletePostedJobForPoster(jobId, uid);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError || error instanceof JobActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Job delete route error:", error);
    return NextResponse.json({ error: "Could not delete this job." }, { status: 500 });
  }
}
