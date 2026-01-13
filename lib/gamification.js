import { db } from "./firebase";
import { 
  doc, updateDoc, increment, Timestamp, runTransaction, getDoc,
  collection, query, orderBy, limit, getDocs // <--- ADDED MISSING IMPORTS
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
      let reward = BASE_REWARD;

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

      const calculatedReward = BASE_REWARD + ((newStreak - 1) * REWARD_INCREMENT);
      reward = Math.min(calculatedReward, MAX_REWARD);

      transaction.update(userRef, {
        balance: increment(reward),
        lastCheckIn: Timestamp.fromDate(now),
        checkInStreak: newStreak
      });

      return { success: true, reward, streak: newStreak };
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    return { success: false, error: typeof error === 'string' ? error : error.message };
  }
};

// --- 2. LEADERBOARD (Fixed) ---
export const getLeaderboard = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("balance", "desc"), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
};

