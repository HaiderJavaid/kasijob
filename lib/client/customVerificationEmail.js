import { authFetch } from "@/lib/client/auth";

export async function sendCustomVerificationEmail(nextPath = "/tasks") {
  try {
    const response = await authFetch("/api/auth/custom-verification-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nextPath }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || "Could not send verification email.",
      };
    }

    return result;
  } catch (error) {
    console.error("Custom verification email request failed:", error);
    return {
      success: false,
      error: error.message || "Could not send verification email.",
    };
  }
}
