import { db } from "./firebase";
import { 
  collection, query, where, getDocs, doc, updateDoc, Timestamp 
} from "firebase/firestore";

/**
 * Calculates Payable vs. Hold based on the "Next 5th" Payout.
 */
export async function getWalletStats(userId, currentBalance = 0) {
  try {
    // 1. Get all APPROVED submissions (unpaid)
    const q = query(
      collection(db, "submissions"),
      where("userId", "==", userId),
      where("status", "==", "approved")
    );
    
    const snap = await getDocs(q);
    
    let hold = 0;

    // 2. CALCULATE THE CUTOFF DATE
    const today = new Date();
    
    // Step A: When is the NEXT Payout? (The 5th)
    let nextPayoutDate = new Date();
    if (today.getDate() >= 5) {
        // If today is Jan 10, next payout is Feb 5
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    }
    nextPayoutDate.setDate(5); 

    // Step B: What is the cutoff for THAT specific payout?
    // Rule: Cutoff is the 25th of the month BEFORE the payout.
    let cutoffDate = new Date(nextPayoutDate);
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    cutoffDate.setDate(25);
    cutoffDate.setHours(23, 59, 59);

    // 3. FILTER EARNINGS
    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.payoutStatus === 'paid') return;

      const amount = parseFloat(data.reward) || 0;
      const earnedDate = data.reviewedAt?.toDate ? data.reviewedAt.toDate() : new Date();

      if (earnedDate > cutoffDate) {
        hold += amount;
      }
    });

    // 4. CALCULATE PAYABLE
    let payable = currentBalance - hold;
    if (payable < 0) payable = 0;

    return { payable, hold };

  } catch (error) {
    console.error("Error calculating wallet stats:", error);
    return { payable: 0, hold: 0 };
  }
}

export async function saveBankDetails(userId, bankData) {
  if (!userId || !bankData.accountNumber) throw new Error("Invalid Data");
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    bankDetails: { ...bankData, updatedAt: Timestamp.now() }
  });
  return { success: true };
}