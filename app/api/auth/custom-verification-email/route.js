import { NextResponse } from "next/server";
import { requireServerUser, RequestAuthError } from "@/lib/server/auth";
import { sendCustomVerificationEmail } from "@/lib/server/customVerificationMailer";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { decodedToken } = await requireServerUser(request);
    const body = await request.json().catch(() => ({}));
    const result = await sendCustomVerificationEmail({
      authUser: decodedToken,
      nextPath: body.nextPath,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Could not send verification email." },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyVerified: Boolean(result.alreadyVerified),
      id: result.id || null,
    });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details || null },
        { status: error.status }
      );
    }

    console.error("Custom verification email failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not send verification email." },
      { status: 500 }
    );
  }
}
