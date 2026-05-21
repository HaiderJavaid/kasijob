import { authFetch } from "@/lib/client/auth";

export async function reviewSubmission(submissionId, action) {
  try {
    const response = await authFetch(`/api/admin/submissions/${submissionId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Review request failed." };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Review request failed.",
    };
  }
}

async function postAdminJson(url, payload = {}, method = "POST") {
  const response = await authFetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "DELETE" ? undefined : JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Admin request failed.");
  }

  return data;
}

export async function backfillReferralCodesAction() {
  return postAdminJson("/api/admin/referrals/backfill");
}

export async function manualLinkUserAction(childEmail, parentCode) {
  return postAdminJson("/api/admin/referrals/link", {
    childEmail,
    parentCode,
  });
}

export async function unlinkUserAction(userEmail) {
  return postAdminJson("/api/admin/referrals/unlink", {
    userEmail,
  });
}

export async function runReferralPayoutSyncAction() {
  return postAdminJson("/api/admin/referrals/payout-sync");
}

export async function createTaskAction(taskData) {
  return postAdminJson("/api/admin/tasks", taskData);
}

export async function updateTaskAction(taskId, taskData) {
  return postAdminJson(`/api/admin/tasks/${taskId}`, taskData, "PATCH");
}

export async function deleteTaskAction(taskId) {
  return postAdminJson(`/api/admin/tasks/${taskId}`, {}, "DELETE");
}
