import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getFirebaseAdminAuth } from "@/lib/server/firebaseAdmin";

const DEFAULT_APP_URL = "http://localhost:3000";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, "");
}

function normalizeNextPath(nextPath) {
  if (!nextPath || typeof nextPath !== "string") {
    return "/tasks";
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/tasks";
  }

  return nextPath;
}

async function renderVerificationEmail({ userName, userEmail, verificationLink }) {
  const templatePath = path.join(process.cwd(), "docs", "email-verification-template.html");
  const template = await readFile(templatePath, "utf8");

  return template
    .replaceAll("{{user_name}}", escapeHtml(userName || "there"))
    .replaceAll("{{user_email}}", escapeHtml(userEmail))
    .replaceAll("{{verification_link}}", verificationLink);
}

async function sendResendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      success: false,
      status: 501,
      error: "Custom email is not configured. Add RESEND_API_KEY and EMAIL_FROM.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error: result?.message || result?.error || "Resend could not send the verification email.",
    };
  }

  return { success: true, id: result?.id || null };
}

export async function sendCustomVerificationEmail({ authUser, nextPath }) {
  if (!authUser?.uid || !authUser?.email) {
    return { success: false, status: 400, error: "Missing authenticated email user." };
  }

  if (authUser.emailVerified) {
    return { success: true, alreadyVerified: true };
  }

  const safeNextPath = normalizeNextPath(nextPath);
  const appUrl = getAppUrl();
  const continueUrl = `${appUrl}/verify-email?next=${encodeURIComponent(safeNextPath)}`;
  const verificationLink = await getFirebaseAdminAuth().generateEmailVerificationLink(authUser.email, {
    url: continueUrl,
    handleCodeInApp: false,
  });
  const displayName = authUser.name || authUser.displayName || authUser.email.split("@")[0];
  const html = await renderVerificationEmail({
    userName: displayName,
    userEmail: authUser.email,
    verificationLink,
  });

  return sendResendEmail({
    to: authUser.email,
    subject: "Verify your KasiJobs email",
    html,
  });
}
