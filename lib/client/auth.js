import { auth } from "@/lib/firebase";

function decodeJwtPayload(idToken) {
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
}

async function waitForCurrentUser() {
  if (!auth) {
    return null;
  }

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function getCurrentIdToken(forceRefresh = false) {
  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const currentUser = auth.currentUser || await waitForCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  return currentUser.getIdToken(forceRefresh);
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const idToken = await getCurrentIdToken();

  headers.set("Authorization", `Bearer ${idToken}`);

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  const retryHeaders = new Headers(init.headers || {});
  const freshIdToken = await getCurrentIdToken(true);
  retryHeaders.set("Authorization", `Bearer ${freshIdToken}`);

  return fetch(input, {
    ...init,
    headers: retryHeaders,
  });
}

export async function getAuthDebugInfo() {
  try {
    const idToken = await getCurrentIdToken(true);
    const tokenPayload = decodeJwtPayload(idToken);
    const response = await fetch("/api/auth/debug");
    const serverDebug = response.ok ? await response.json() : {};

    return {
      clientProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
      tokenAudience: tokenPayload?.aud || null,
      tokenIssuer: tokenPayload?.iss || null,
      adminProjectId: serverDebug.adminProjectId || null,
    };
  } catch (error) {
    return { error: error.message };
  }
}
