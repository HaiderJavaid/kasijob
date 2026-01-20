import { db } from "./firebase";
import { 
  collection, addDoc, getDoc, getDocs, updateDoc, doc, 
  query, where, orderBy, increment, Timestamp, runTransaction, setDoc 
} from "firebase/firestore";

const TASKS_COLLECTION = "tasks";
const SUBMISSIONS_COLLECTION = "submissions";
const USERS_COLLECTION = "users";
const COUNTERS_COLLECTION = "counters";

// --- 1. ADMIN: ADD TASK (Supports Description & Instructions) ---
export const addTask = async (taskData) => {
  try {
    await runTransaction(db, async (transaction) => {
      // A. Get the current counter
      const counterRef = doc(db, COUNTERS_COLLECTION, "taskCounter");
      const counterDoc = await transaction.get(counterRef);
      
      let newId = 1000; // Start at #1000 if no tasks exist
      if (counterDoc.exists()) {
        newId = counterDoc.data().current + 1;
      }

      // B. Prepare Expiry Date (Convert string to Timestamp)
      let finalExpiry = null;
      if (taskData.expiryDate) {
          finalExpiry = Timestamp.fromDate(new Date(taskData.expiryDate));
      }

      // C. Create the Task
      const newTaskRef = doc(collection(db, TASKS_COLLECTION));
      transaction.set(newTaskRef, {
        ...taskData, // This automatically saves 'description' AND 'instructions'
        expiryDate: finalExpiry, 
        readableId: newId,
        isActive: true,
        createdAt: Timestamp.now(),
        completedCount: 0 
      });

      // D. Update the counter
      transaction.set(counterRef, { current: newId });
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: error.message };
  }
};

// --- 2. USER: GET ACTIVE TASKS (Filtered) ---
// Updated: Now accepts userId to filter out their own submissions
export const getActiveTasks = async (userId) => {
  try {
    // 1. Fetch ALL active tasks first
    const q = query(
      collection(db, TASKS_COLLECTION), 
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    let allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch THIS USER'S submissions to see what they already did
    let userSubmissions = [];
    if (userId) {
        const subQ = query(
            collection(db, SUBMISSIONS_COLLECTION), 
            where("userId", "==", userId)
        );
        const subSnap = await getDocs(subQ);
        userSubmissions = subSnap.docs.map(d => d.data().taskId);
    }

    const now = new Date();

    // 3. Filter: Remove tasks the user already submitted
    const availableTasks = allTasks.filter(t => {
        // A. Filter out tasks present in userSubmissions
        if (userSubmissions.includes(t.id)) {
            return false; 
        }

        // B. Check Global Limit (if set)
        if (t.limit && t.limit > 0 && (t.completedCount || 0) >= t.limit) {
            return false;
        }

        // C. Check Expiry
        if (t.expiryDate) {
            const expiry = t.expiryDate.toDate ? t.expiryDate.toDate() : new Date(t.expiryDate);
            if (expiry < now) {
                return false; 
            }
        }
        
        return true;
    });

    return availableTasks.sort((a, b) => (b.readableId || 0) - (a.readableId || 0));
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
      readableId: readableId || 0,
      reward: Number(taskReward), 
      proof: proofText,
      status: "pending", 
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
    
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
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
        reviewedAt: Timestamp.now()
      });

     if (action === "approved") {
        const userRef = doc(db, USERS_COLLECTION, subData.userId);
        transaction.update(userRef, {
          balance: increment(subData.reward) 
        });

        // Increment Task Completion Count
        const taskRef = doc(db, TASKS_COLLECTION, subData.taskId);
        transaction.update(taskRef, {
            completedCount: increment(1)
        });
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Review Error:", error);
    return { success: false, error: error.message };
  }
};

// --- 7. HELPER: GET TASK BY ID ---
export const getTaskById = async (taskId) => {
    try {
        const docRef = doc(db, TASKS_COLLECTION, taskId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting task:", error);
        return null;
    }
};