import { db } from "./firebase";
import { 
  collection, query, where, getDocs, doc, updateDoc, Timestamp 
} from "firebase/firestore";

/**
 * Calculates Payable vs. Hold based on the "Next 5th" Payout.
 * * RULE:
 * 1. Identify the NEXT Payout Date (The upcoming 5th).
 * 2. Identify the Cutoff for that Payout (The 25th of the previous month).
 * 3. IF earningDate <= Cutoff -> It makes the bus! (PAYABLE).
 * 4. IF earningDate > Cutoff -> It missed the bus. (HOLD).
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
    // (If today was Jan 2, next payout would be Jan 5)

    // Step B: What is the cutoff for THAT specific payout?
    // Rule: Cutoff is the 25th of the month BEFORE the payout.
    let cutoffDate = new Date(nextPayoutDate);
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    cutoffDate.setDate(25);
    cutoffDate.setHours(23, 59, 59);

    // 3. FILTER EARNINGS
    snap.docs.forEach((doc) => {
      const data = doc.data();
      
      // If already marked paid, skip
      if (data.payoutStatus === 'paid') return;

      const amount = parseFloat(data.reward) || 0;
      const earnedDate = data.reviewedAt?.toDate ? data.reviewedAt.toDate() : new Date();

      // LOGIC CHECK:
      // Case 1 (Today Jan 10): Cutoff is Jan 25. Task done Jan 10.
      // 10 <= 25? YES. -> Payable.
      
      // Case 2 (Today Jan 26): Cutoff is Jan 25. Task done Jan 26.
      // 26 <= 25? NO. -> Hold (Missed the cutoff).

      if (earnedDate > cutoffDate) {
        hold += amount;
      }
    });

    // 4. CALCULATE PAYABLE
    // Payable is whatever remains. This AUTOMATICALLY includes Daily Rewards.
    // Since Daily Rewards have no "submission" record to check date, 
    // they essentially become "Instant Payable", which is a nice perk for users.
    let payable = currentBalance - hold;
    if (payable < 0) payable = 0;

    return { payable, hold };

  } catch (error) {
    console.error("Error calculating wallet stats:", error);
    return { payable: 0, hold: 0 };
  }
}

// ... existing saveBankDetails function ...
export async function saveBankDetails(userId, bankData) {
  if (!userId || !bankData.accountNumber) throw new Error("Invalid Data");
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    bankDetails: { ...bankData, updatedAt: Timestamp.now() }
  });
  return { success: true };
}

// import { db } from "./firebase";
// import { 
//   collection, addDoc, doc, getDoc, getDocs,
//   query, where, orderBy, limit, 
//   runTransaction, Timestamp 
// } from "firebase/firestore";

// const WITHDRAWALS_COLLECTION = "withdrawals";
// const USERS_COLLECTION = "users";

// // --- REQUEST WITHDRAWAL ---
// export const requestWithdrawal = async (userId, amount, method, details) => {
//   // method: "TNG" or "BANK"
//   // details: { accountName, accountNumber, bankName (optional) }
  
//   if (amount < 30) return { success: false, error: "Minimum withdrawal is RM 50" };

//   try {
//     await runTransaction(db, async (transaction) => {
//       // 1. Get User Data
//       const userRef = doc(db, USERS_COLLECTION, userId);
//       const userDoc = await transaction.get(userRef);
      
//       if (!userDoc.exists()) throw "User does not exist";
      
//       const userData = userDoc.data();
//       const currentBalance = userData.balance || 0;

//       // 2. Check Sufficient Funds
//       if (currentBalance < amount) {
//         throw "Insufficient balance!";
//       }

//       // 3. Deduct Balance Immediately
//       transaction.update(userRef, {
//         balance: currentBalance - amount
//       });

//       // 4. Create Withdrawal Record
//       const newWithdrawalRef = doc(collection(db, WITHDRAWALS_COLLECTION));
//       transaction.set(newWithdrawalRef, {
//         userId,
//         amount: Number(amount),
//         method,
//         details, // Object containing bank info
//         status: "pending", // pending -> paid -> rejected
//         requestedAt: Timestamp.now()
//       });
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Withdrawal Error:", error);
//     return { success: false, error: typeof error === "string" ? error : error.message };
//   }
// };

// // --- GET WITHDRAWAL HISTORY ---
// export const getWithdrawalHistory = async (userId) => {
//   try {
//     const q = query(
//       collection(db, WITHDRAWALS_COLLECTION), 
//       where("userId", "==", userId),
//       orderBy("requestedAt", "desc")
//     );
//     const snapshot = await getDocs(q); // Note: Requires Index potentially
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error("Error fetching history:", error);
//     // Fallback if index missing: just return empty or unordered
//     return []; 
//   }
// };