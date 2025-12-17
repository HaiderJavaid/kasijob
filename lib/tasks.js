import { db } from "./firebase";
import { 
  collection, addDoc, getDoc, getDocs, updateDoc, doc, 
  query, where, orderBy, increment, Timestamp, runTransaction 
} from "firebase/firestore";

const TASKS_COLLECTION = "tasks";
const SUBMISSIONS_COLLECTION = "submissions";
const USERS_COLLECTION = "users";

// --- 1. ADMIN: ADD TASK (Fixes your current error) ---
export const addTask = async (taskData) => {
  try {
    await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      isActive: true,
      createdAt: Timestamp.now(),
      completedCount: 0 
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: error.message };
  }
};

// --- 2. USER: GET ACTIVE TASKS ---
export const getActiveTasks = async () => {
  try {
    // Note: We removed orderBy temporarily to prevent Index errors until you fix them in console
    const q = query(collection(db, TASKS_COLLECTION), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// --- 3. USER: SUBMIT PROOF ---
export const submitTaskProof = async (userId, taskId, taskTitle, taskReward, proofText) => {
  try {
    await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      userId,
      taskId,
      taskTitle,
      reward: Number(taskReward), // Snapshot the reward amount here for safety
      proof: proofText,
      status: "pending", // Default status
      submittedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting task:", error);
    return { success: false, error: error.message };
  }
};

// --- 4. USER: GET MY HISTORY ---
export const getUserSubmissions = async (userId) => {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
};

// --- 5. ADMIN: GET ALL PENDING SUBMISSIONS ---
export const getPendingSubmissions = async () => {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting pending reviews:", error);
    return [];
  }
};

// --- 6. ADMIN: REVIEW SUBMISSION (Approve & Pay) ---
export const reviewSubmission = async (submissionId, action) => {
  // action must be "approved" or "rejected"
  try {
    await runTransaction(db, async (transaction) => {
      // A. Get the submission doc
      const subRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      const subDoc = await transaction.get(subRef);
      
      if (!subDoc.exists()) throw "Document does not exist!";
      
      const subData = subDoc.data();
      if (subData.status !== "pending") throw "Submission already reviewed!";

      // B. Update Submission Status
      transaction.update(subRef, { 
        status: action,
        reviewedAt: Timestamp.now()
      });

      // C. IF APPROVED: Pay the user!
      if (action === "approved") {
        const userRef = doc(db, USERS_COLLECTION, subData.userId);
        transaction.update(userRef, {
          balance: increment(subData.reward) // Magically adds the exact reward amount
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Review Error:", error);
    return { success: false, error: error.message };
  }
};