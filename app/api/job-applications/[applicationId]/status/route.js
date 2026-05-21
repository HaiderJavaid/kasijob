import { NextResponse } from "next/server";

import { RequestAuthError, requireServerUser } from "@/lib/server/auth";
import {
  JobApplicationActionError,
  updateJobApplicationStatusForPoster,
} from "@/lib/server/jobApplications";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { uid } = await requireServerUser(request);
    const { applicationId } = await params;
    const { action } = await request.json();

    const result = await updateJobApplicationStatusForPoster(applicationId, action, uid);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError || error instanceof JobApplicationActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Job application status route error:", error);
    return NextResponse.json({ error: "Could not update application status." }, { status: 500 });
  }
}
