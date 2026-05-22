import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export function getFirebaseAdminConfigStatus() {
  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
    hasClientEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  };
}

function getFirebaseAdminCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    const missingFields = [
      !projectId ? "FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID" : null,
      !clientEmail ? "FIREBASE_ADMIN_CLIENT_EMAIL" : null,
      !privateKey ? "FIREBASE_ADMIN_PRIVATE_KEY" : null,
    ].filter(Boolean);

    throw new Error(`Firebase Admin credentials are missing: ${missingFields.join(", ")}.`);
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
