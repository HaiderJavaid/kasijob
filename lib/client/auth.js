import { auth } from "@/lib/firebase";

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

export async function getCurrentIdToken() {
  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const currentUser = auth.currentUser || await waitForCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  return currentUser.getIdToken();
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const idToken = await getCurrentIdToken();

  headers.set("Authorization", `Bearer ${idToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
