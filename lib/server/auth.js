import "server-only";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

export class RequestAuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = "RequestAuthError";
    this.status = status;
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
    throw new RequestAuthError("Invalid or expired Firebase ID token.", 401);
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
