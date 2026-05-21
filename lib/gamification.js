import { db } from "./firebase";
import { 
  doc, updateDoc, increment, Timestamp, runTransaction, getDoc,
  collection, query, orderBy, limit, getDocs 
} from "firebase/firestore";

// CONFIGURATION
const BASE_REWARD = 0.10;
const MAX_REWARD = 0.50;
const REWARD_INCREMENT = 0.10;

// --- 1. DAILY CHECK-IN ---
export const performDailyCheckIn = async (userId) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) throw "User not found";

      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn ? userData.lastCheckIn.toDate() : null;
      const now = new Date();

      let newStreak = 1;

      // YOUR EXISTING STREAK LOGIC (UNCHANGED)
      if (lastCheckIn) {
        const diffTime = Math.abs(now - lastCheckIn);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); 

        if (diffHours < 20) {
            throw "Already checked in today. Come back later!";
        }

        if (diffHours < 48) {
            newStreak = (userData.checkInStreak || 0) + 1;
        } else {
            newStreak = 1;
        }
      }

      // YOUR EXISTING REWARD LOGIC (UNCHANGED)
      const calculatedReward = BASE_REWARD + ((newStreak - 1) * REWARD_INCREMENT);
      const reward = Math.min(calculatedReward, MAX_REWARD);

      // 1. Update User
      transaction.update(userRef, {
        balance: increment(reward),
        lastCheckIn: Timestamp.fromDate(now),
        checkInStreak: newStreak
      });

      // 2. CREATE TRANSACTION RECORD (NEW ADDITION ONLY)
      // This makes it show up in your Admin Transaction Page
      const transRef = doc(collection(db, "transactions"));
      transaction.set(transRef, {
        userId,
        userName: userData.name || userData.email,
        userEmail: userData.email,
        amount: reward,
        type: "credit",
        source: "daily_streak",
        description: `Day ${newStreak} Login Bonus`,
        createdAt: Timestamp.fromDate(now),
        dateString: now.toISOString().split('T')[0]
      });

      return { success: true, reward, streak: newStreak };
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    return { success: false, error: typeof error === 'string' ? error : error.message };
  }
};

// --- 2. LEADERBOARD (Unchanged) ---
export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("balance", "desc"), limit(25));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.emailVerified !== false)
      .slice(0, 10);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
};
