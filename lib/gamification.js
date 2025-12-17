import { db } from "./firebase";
import { doc, updateDoc, increment, getDoc, Timestamp, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// --- 1. DAILY CHECK-IN ---
export const performDailyCheckIn = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return { success: false, error: "User not found" };

  const userData = userSnap.data();
  const lastCheckIn = userData.lastCheckIn?.toDate();
  const now = new Date();

  // Check if 24 hours have passed
  if (lastCheckIn) {
    const hoursDiff = (now - lastCheckIn) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      return { success: false, error: "Come back tomorrow!", wait: true };
    }
  }

  // Give Reward (e.g., RM 0.10)
  await updateDoc(userRef, {
    balance: increment(0.10),
    lastCheckIn: Timestamp.now()
  });

  return { success: true, reward: 0.10 };
};

// --- 2. GET LEADERBOARD ---
export const getLeaderboard = async () => {
  try {
    // Sort by Balance (Rich List)
    const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Leaderboard error:", error);
    return [];
  }
};