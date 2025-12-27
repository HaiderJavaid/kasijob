import { db } from "./firebase";
import { 
  collection, addDoc, getDoc, getDocs, updateDoc, doc, 
  query, where, orderBy, increment, Timestamp, runTransaction, setDoc 
} from "firebase/firestore";

const TASKS_COLLECTION = "tasks";
const SUBMISSIONS_COLLECTION = "submissions";
const USERS_COLLECTION = "users";
const COUNTERS_COLLECTION = "counters"; // New collection for running numbers

// --- 1. ADMIN: ADD TASK (With Auto-Increment ID) ---
export const addTask = async (taskData) => {
  try {
    // We use a transaction to safely increment the ID counter
    await runTransaction(db, async (transaction) => {
      // A. Get the current counter
      const counterRef = doc(db, COUNTERS_COLLECTION, "taskCounter");
      const counterDoc = await transaction.get(counterRef);
      
      let newId = 1000; // Start at #1000 if no tasks exist
      if (counterDoc.exists()) {
        newId = counterDoc.data().current + 1;
      }

      // B. Create the Task with the readable ID
      const newTaskRef = doc(collection(db, TASKS_COLLECTION));
      transaction.set(newTaskRef, {
        ...taskData,
        readableId: newId, // The running number (e.g., 1005)
        isActive: true,
        createdAt: Timestamp.now(),
        completedCount: 0 
      });

      // C. Update the counter
      transaction.set(counterRef, { current: newId });
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
    // We sort by readableId descending so newest tasks (#1005) show first
    // Note: If you get an index error, click the link in console!
    const q = query(
      collection(db, TASKS_COLLECTION), 
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    
    // Client-side sort to avoid index headaches for now
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return tasks.sort((a, b) => (b.readableId || 0) - (a.readableId || 0));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

// --- 3. USER: SUBMIT PROOF ---
export const submitTaskProof = async (userId, taskId, taskTitle, taskReward, proofText, readableId) => {
  try {
    await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      userId,
      taskId,
      taskTitle,
      readableId: readableId || 0, // Save the visual ID to history
      reward: Number(taskReward), 
      proof: proofText,
      status: "pending", 
      submittedAt: Timestamp.now() // Save date
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting task:", error);
    return { success: false, error: error.message };
  }
};

// --- 4. USER: GET MY HISTORY (Sorted by Date) ---
export const getUserSubmissions = async (userId) => {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by Date Descending (Newest First)
    return submissions.sort((a, b) => {
      const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(0);
      const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
};

// --- 5. ADMIN: GET ALL PENDING ---
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

// --- 6. ADMIN: REVIEW SUBMISSION ---
export const reviewSubmission = async (submissionId, action) => {
  try {
    await runTransaction(db, async (transaction) => {
      const subRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      const subDoc = await transaction.get(subRef);
      if (!subDoc.exists()) throw "Document does not exist!";
      const subData = subDoc.data();
      if (subData.status !== "pending") throw "Already reviewed!";

      transaction.update(subRef, { 
        status: action,
        reviewedAt: Timestamp.now() // Add timestamp of review
      });

      if (action === "approved") {
        const userRef = doc(db, USERS_COLLECTION, subData.userId);
        transaction.update(userRef, {
          balance: increment(subData.reward) 
        });
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Review Error:", error);
    return { success: false, error: error.message };
  }
};