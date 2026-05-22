import "server-only";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

export class RequestAuthError extends Error {
  constructor(message, status = 401, details = null) {
    super(message);
    this.name = "RequestAuthError";
    this.status = status;
    this.details = details;
  }
}

function decodeJwtPayload(idToken) {
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = Buffer.from(normalizedPayload, "base64").toString("utf8");
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

function getBearerToken(request) {
  const authorizationHeader = request.headers.get("authorization") || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new RequestAuthError("Missing Firebase ID token.", 401);
  }

  const idToken = authorizationHeader.slice("Bearer ".length).trim();

  if (!idToken) {
    throw new RequestAuthError("Missing Firebase ID token.", 401);
  }

  return idToken;
}

export async function requireServerUser(request) {
  const idToken = getBearerToken(request);

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);

    return {
      uid: decodedToken.uid,
      decodedToken,
    };
  } catch (error) {
    if (error instanceof RequestAuthError) {
      throw error;
    }

    console.error("Firebase ID token verification failed:", error);
    if (error?.message?.startsWith("Firebase Admin credentials are missing:")) {
      throw new RequestAuthError(error.message, 500);
    }

    const tokenPayload = decodeJwtPayload(idToken);
    const details =
      process.env.NODE_ENV === "development"
        ? {
            adminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID || null,
            tokenAudience: tokenPayload?.aud || null,
            tokenIssuer: tokenPayload?.iss || null,
            firebaseErrorCode: error?.code || null,
          }
        : null;

    throw new RequestAuthError("Invalid or expired Firebase ID token.", 401, details);
  }
}

export async function getServerUserRole(uid) {
  const adminDb = await getFirebaseAdminDb();
  const userSnapshot = await adminDb.collection("users").doc(uid).get();

  if (!userSnapshot.exists) {
    return null;
  }

  return userSnapshot.data()?.role || null;
}

export async function requireServerAdmin(request) {
  const user = await requireServerUser(request);
  const role = await getServerUserRole(user.uid);

  if (role !== "admin") {
    throw new RequestAuthError("Admin access required.", 403);
  }

  return user;
}
