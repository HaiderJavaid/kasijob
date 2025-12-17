import { db } from "./firebase";
import { 
  collection, addDoc, doc, getDoc, getDocs,
  query, where, orderBy, limit, 
  runTransaction, Timestamp 
} from "firebase/firestore";

const WITHDRAWALS_COLLECTION = "withdrawals";
const USERS_COLLECTION = "users";

// --- REQUEST WITHDRAWAL ---
export const requestWithdrawal = async (userId, amount, method, details) => {
  // method: "TNG" or "BANK"
  // details: { accountName, accountNumber, bankName (optional) }
  
  if (amount < 50) return { success: false, error: "Minimum withdrawal is RM 50" };

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Get User Data
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) throw "User does not exist";
      
      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;

      // 2. Check Sufficient Funds
      if (currentBalance < amount) {
        throw "Insufficient balance!";
      }

      // 3. Deduct Balance Immediately
      transaction.update(userRef, {
        balance: currentBalance - amount
      });

      // 4. Create Withdrawal Record
      const newWithdrawalRef = doc(collection(db, WITHDRAWALS_COLLECTION));
      transaction.set(newWithdrawalRef, {
        userId,
        amount: Number(amount),
        method,
        details, // Object containing bank info
        status: "pending", // pending -> paid -> rejected
        requestedAt: Timestamp.now()
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return { success: false, error: typeof error === "string" ? error : error.message };
  }
};

// --- GET WITHDRAWAL HISTORY ---
export const getWithdrawalHistory = async (userId) => {
  try {
    const q = query(
      collection(db, WITHDRAWALS_COLLECTION), 
      where("userId", "==", userId),
      orderBy("requestedAt", "desc")
    );
    const snapshot = await getDocs(q); // Note: Requires Index potentially
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching history:", error);
    // Fallback if index missing: just return empty or unordered
    return []; 
  }
};