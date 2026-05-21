import "server-only";

import { timingSafeEqual } from "node:crypto";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

export class PostbackAuthError extends Error {
  constructor(message, status = 403) {
    super(message);
    this.name = "PostbackAuthError";
    this.status = status;
  }
}

function getPostbackSecret() {
  const secret = process.env.POSTBACK_SHARED_SECRET;

  if (!secret) {
    throw new PostbackAuthError("Postback secret is not configured.", 503);
  }

  return secret;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function buildTransactionId(provider, userId, offerId) {
  return `${provider}_${userId}_${offerId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function requireTrustedPostback(searchParams) {
  const providedSecret = searchParams.get("secret") || "";
  const expectedSecret = getPostbackSecret();

  if (!providedSecret || !safeEqual(providedSecret, expectedSecret)) {
    throw new PostbackAuthError("Forbidden.", 403);
  }
}

export async function processOfferwallPostback({ provider, userId, amount, offerId, ip }) {
  if (!userId || !offerId || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid postback payload.");
  }

  const adminDb = await getFirebaseAdminDb();
  const { FieldValue } = await import("firebase-admin/firestore");
  const transactionId = buildTransactionId(provider, userId, offerId);

  return adminDb.runTransaction(async (transaction) => {
    const userRef = adminDb.collection("users").doc(userId);
    const rewardRef = adminDb.collection("transactions").doc(transactionId);

    const [userDoc, rewardDoc] = await Promise.all([
      transaction.get(userRef),
      transaction.get(rewardRef),
    ]);

    if (rewardDoc.exists) {
      return { duplicate: true };
    }

    if (!userDoc.exists) {
      throw new Error("User does not exist.");
    }

    transaction.update(userRef, {
      balance: FieldValue.increment(amount),
    });

    transaction.set(rewardRef, {
      userId,
      amount,
      type: "offerwall",
      source: provider,
      offerId,
      externalId: offerId,
      ip: ip || null,
      createdAt: FieldValue.serverTimestamp(),
      dateString: new Date().toISOString().split("T")[0],
    });

    return { duplicate: false };
  });
}
