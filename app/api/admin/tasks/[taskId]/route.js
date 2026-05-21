import { NextResponse } from "next/server";

import { RequestAuthError, requireServerAdmin } from "@/lib/server/auth";
import { deleteTask, updateTask } from "@/lib/server/tasks";

export const runtime = "nodejs";

function getStatusForMessage(message) {
  if (
    message === "Missing required task fields." ||
    message === "Reward must be greater than 0." ||
    message === "Task ID is required." ||
    message === "Task not found."
  ) {
    return 400;
  }

  return 500;
}

export async function PATCH(request, { params }) {
  try {
    await requireServerAdmin(request);

    const { taskId } = await params;
    const payload = await request.json();
    const result = await updateTask(taskId, payload);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to update task.";
    console.error("Admin task update route error:", error);
    return NextResponse.json({ error: message }, { status: getStatusForMessage(message) });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireServerAdmin(request);

    const { taskId } = await params;
    const result = await deleteTask(taskId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to delete task.";
    console.error("Admin task delete route error:", error);
    return NextResponse.json({ error: message }, { status: getStatusForMessage(message) });
  }
}
