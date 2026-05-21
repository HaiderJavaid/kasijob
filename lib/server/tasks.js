import "server-only";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

const TASKS_COLLECTION = "tasks";
const SUBMISSIONS_COLLECTION = "submissions";
const USERS_COLLECTION = "users";
const COUNTERS_COLLECTION = "counters";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTaskPayload(taskData = {}) {
  const expiryDate = taskData.expiryDate ? new Date(taskData.expiryDate) : null;

  return {
    title: String(taskData.title || "").trim(),
    description: String(taskData.description || "").trim(),
    instructions: String(taskData.instructions || "").trim(),
    reward: toNumber(taskData.reward),
    link: String(taskData.link || "").trim(),
    type: String(taskData.type || "social").trim(),
    platform: String(taskData.platform || "none").trim(),
    expiryDate: expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate : null,
    limit: Math.max(0, Math.trunc(toNumber(taskData.limit))),
  };
}

function validateTaskPayload(taskData) {
  if (!taskData.title || !taskData.description || !taskData.instructions || !taskData.link) {
    throw new Error("Missing required task fields.");
  }

  if (taskData.reward <= 0) {
    throw new Error("Reward must be greater than 0.");
  }
}

export async function createTask(taskData) {
  const normalizedTask = normalizeTaskPayload(taskData);
  validateTaskPayload(normalizedTask);

  const adminDb = await getFirebaseAdminDb();
  const { Timestamp } = await import("firebase-admin/firestore");

  const taskId = await adminDb.runTransaction(async (transaction) => {
    const counterRef = adminDb.collection(COUNTERS_COLLECTION).doc("taskCounter");
    const counterDoc = await transaction.get(counterRef);

    let readableId = 1000;
    if (counterDoc.exists) {
      readableId = (counterDoc.data()?.current || 999) + 1;
    }

    const taskRef = adminDb.collection(TASKS_COLLECTION).doc();
    transaction.set(taskRef, {
      ...normalizedTask,
      expiryDate: normalizedTask.expiryDate ? Timestamp.fromDate(normalizedTask.expiryDate) : null,
      readableId,
      isActive: true,
      createdAt: Timestamp.now(),
      completedCount: 0,
    });

    transaction.set(counterRef, { current: readableId });

    return taskRef.id;
  });

  return { success: true, id: taskId };
}

export async function updateTask(taskId, taskData) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const normalizedTask = normalizeTaskPayload(taskData);
  validateTaskPayload(normalizedTask);

  const adminDb = await getFirebaseAdminDb();
  const { Timestamp } = await import("firebase-admin/firestore");
  const taskRef = adminDb.collection(TASKS_COLLECTION).doc(taskId);
  const taskDoc = await taskRef.get();

  if (!taskDoc.exists) {
    throw new Error("Task not found.");
  }

  await taskRef.update({
    ...normalizedTask,
    expiryDate: normalizedTask.expiryDate ? Timestamp.fromDate(normalizedTask.expiryDate) : null,
  });

  return { success: true };
}

export async function deleteTask(taskId) {
  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const adminDb = await getFirebaseAdminDb();
  const taskRef = adminDb.collection(TASKS_COLLECTION).doc(taskId);
  const taskDoc = await taskRef.get();

  if (!taskDoc.exists) {
    throw new Error("Task not found.");
  }

  await taskRef.delete();

  return { success: true };
}

export async function reviewTaskSubmission(submissionId, action) {
  if (!submissionId) {
    throw new Error("Submission ID is required.");
  }

  if (!["approved", "rejected"].includes(action)) {
    throw new Error("Invalid review action.");
  }

  const adminDb = await getFirebaseAdminDb();
  const { FieldValue } = await import("firebase-admin/firestore");

  await adminDb.runTransaction(async (transaction) => {
    const submissionRef = adminDb.collection(SUBMISSIONS_COLLECTION).doc(submissionId);
    const submissionDoc = await transaction.get(submissionRef);

    if (!submissionDoc.exists) {
      throw new Error("Submission does not exist.");
    }

    const submissionData = submissionDoc.data();

    if (submissionData.status !== "pending") {
      throw new Error("Already reviewed.");
    }

    let userDoc = null;
    const userRef = adminDb.collection(USERS_COLLECTION).doc(submissionData.userId);

    if (action === "approved") {
      userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found.");
      }
    }

    transaction.update(submissionRef, {
      status: action,
      reviewedAt: FieldValue.serverTimestamp(),
    });

    if (action === "approved") {
      transaction.update(userRef, {
        balance: FieldValue.increment(submissionData.reward),
      });

      const rewardRef = adminDb.collection("transactions").doc();
      transaction.set(rewardRef, {
        userId: submissionData.userId,
        userName: userDoc.data().name || userDoc.data().email,
        userEmail: userDoc.data().email,
        amount: submissionData.reward,
        type: "credit",
        source: "task_reward",
        description: `Task Approved: ${submissionData.taskTitle}`,
        createdAt: FieldValue.serverTimestamp(),
        dateString: new Date().toISOString().split("T")[0],
      });

      const taskRef = adminDb.collection(TASKS_COLLECTION).doc(submissionData.taskId);
      transaction.update(taskRef, {
        completedCount: FieldValue.increment(1),
      });
    }
  });
}
