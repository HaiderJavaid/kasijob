import "server-only";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 6; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export async function backfillReferralCodesServer() {
  const adminDb = await getFirebaseAdminDb();
  const snapshot = await adminDb.collection("users").get();
  const batch = adminDb.batch();
  let count = 0;

  snapshot.docs.forEach((userDoc) => {
    if (!userDoc.data().referralCode) {
      batch.update(userDoc.ref, { referralCode: generateReferralCode() });
      count += 1;
    }
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

export async function manualLinkUserServer(childEmail, parentCode) {
  const adminDb = await getFirebaseAdminDb();
  const usersRef = adminDb.collection("users");

  const [childSnap, parentSnap] = await Promise.all([
    usersRef.where("email", "==", childEmail).limit(1).get(),
    usersRef.where("referralCode", "==", parentCode).limit(1).get(),
  ]);

  if (childSnap.empty) {
    throw new Error("Child email not found");
  }

  if (parentSnap.empty) {
    throw new Error("Parent code not found");
  }

  const childDoc = childSnap.docs[0];
  const parentDoc = parentSnap.docs[0];

  if (childDoc.id === parentDoc.id) {
    throw new Error("Cannot link to self");
  }

  await childDoc.ref.update({
    referredBy: parentDoc.id,
    referredByCode: parentCode,
  });
}

export async function unlinkUserServer(userEmail) {
  const adminDb = await getFirebaseAdminDb();
  const usersRef = adminDb.collection("users");
  const userSnap = await usersRef.where("email", "==", userEmail).limit(1).get();

  if (userSnap.empty) {
    throw new Error("User not found");
  }

  await userSnap.docs[0].ref.update({
    referredBy: null,
    referredByCode: null,
  });
}
