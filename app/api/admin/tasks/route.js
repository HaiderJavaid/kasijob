import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { createTask } from "@/lib/server/tasks";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireServerAdmin(request);

    const payload = await request.json();
    const result = await createTask(payload);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to create task.";
    const status = message === "Missing required task fields." || message === "Reward must be greater than 0."
      ? 400
      : 500;

    console.error("Admin task create route error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
