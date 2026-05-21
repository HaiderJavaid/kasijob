import "server-only";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

const LEADER_EMAILS = [
  "muhd.haider111@gmail.com",
  "nikrash@gmail.com",
  "haziqnik13@gmail.com",
  "hakimnik12@gmail.com",
];

function countTotalDownline(userId, allUsers) {
  const directChildren = allUsers.filter((user) => user.referredBy === userId);
  let count = directChildren.length;

  directChildren.forEach((child) => {
    count += countTotalDownline(child.id, allUsers);
  });

  return count;
}

export async function generateRetroactiveRewardsServer() {
  const adminDb = await getFirebaseAdminDb();
  const { FieldValue } = await import("firebase-admin/firestore");
  const usersSnap = await adminDb.collection("users").get();
  const allUsers = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const results = { updated: 0, totalPaid: 0 };

  for (const user of allUsers) {
    let rewardAmount = 0;
    let rewardType = "";

    if (LEADER_EMAILS.includes(user.email) || user.role === "leader") {
      const totalCount = countTotalDownline(user.id, allUsers);
      if (totalCount > 0) {
        rewardAmount = totalCount * 0.5;
        rewardType = `Leader Bonus (${totalCount} Downline)`;
      }
    } else {
      const directInvites = allUsers.filter((candidate) => candidate.referredBy === user.id).length;
      if (directInvites > 0) {
        rewardAmount = directInvites * 2;
        rewardType = `Referral Bonus (${directInvites} Invites)`;
      }
    }

    if (rewardAmount <= 0) {
      continue;
    }

    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(user.id);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        return;
      }

      transaction.update(userRef, {
        balance: FieldValue.increment(rewardAmount),
      });

      const rewardRef = adminDb.collection("transactions").doc();
      transaction.set(rewardRef, {
        userId: user.id,
        userName: user.name || user.email,
        userEmail: user.email,
        amount: rewardAmount,
        type: "credit",
        source: "retroactive_reward",
        description: rewardType,
        createdAt: FieldValue.serverTimestamp(),
        dateString: new Date().toISOString().split("T")[0],
      });
    });

    results.updated += 1;
    results.totalPaid += rewardAmount;
  }

  return results;
}
