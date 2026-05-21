import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  return { projectId, clientEmail, privateKey };
}

function getFirebaseAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const { projectId, clientEmail, privateKey } = getFirebaseAdminCredentials();

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function getFirebaseAdminDb() {
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore(getFirebaseAdminApp());
}
