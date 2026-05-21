import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { authFetch } from "@/lib/client/auth";

const FIRESTORE_READ_TIMEOUT_MS = 2500;

export const demoMessageThreads = [
  {
    id: "sample-logo-cafe-thread",
    jobId: "sample-logo-cafe",
    jobTitle: "Design a logo for a cafe",
    jobBudget: 50,
    clientName: "Kopi Satu",
    workerName: "Aina",
    status: "waiting_on_client",
    source: "sample",
    updatedAt: new Date("2026-01-04T09:30:00.000Z"),
    messages: [
      {
        id: "sample-logo-1",
        authorName: "Aina",
        authorRole: "worker",
        body: "Hi Kopi Satu, I can send two logo directions tonight. Do you prefer modern or hand-drawn?",
        createdAt: new Date("2026-01-04T09:10:00.000Z"),
      },
      {
        id: "sample-logo-2",
        authorName: "Kopi Satu",
        authorRole: "poster",
        body: "Modern, please. We like warm colors and a simple cup mark.",
        createdAt: new Date("2026-01-04T09:30:00.000Z"),
      },
    ],
  },
  {
    id: "sample-event-helper-thread",
    jobId: "sample-event-helper",
    jobTitle: "Help set up a weekend booth",
    jobBudget: 120,
    clientName: "KasiJobs Beta",
    workerName: "Farid",
    status: "worker_question",
    source: "sample",
    updatedAt: new Date("2026-01-05T15:20:00.000Z"),
    messages: [
      {
        id: "sample-event-1",
        authorName: "Farid",
        authorRole: "worker",
        body: "I am available Saturday morning. What time should I arrive at the booth?",
        createdAt: new Date("2026-01-05T15:05:00.000Z"),
      },
      {
        id: "sample-event-2",
        authorName: "KasiJobs Beta",
        authorRole: "poster",
        body: "Please arrive at 8:30 AM. Admin will confirm the exact location before matching.",
        createdAt: new Date("2026-01-05T15:20:00.000Z"),
      },
    ],
  },
];

const toDate = (value) => {
  if (!value) return null;
  return value.toDate ? value.toDate() : value;
};

const toText = (value, fallback = "") => String(value || fallback).trim();

const withReadTimeout = (operation, label) =>
  Promise.race([
    operation,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), FIRESTORE_READ_TIMEOUT_MS);
    }),
  ]);

const normalizeMessage = (messageData, index = 0) => ({
  id: messageData.id || `message-${index}`,
  authorId: messageData.authorId || null,
  authorName: toText(messageData.authorName, "KasiJobs user"),
  authorRole: messageData.authorRole || "participant",
  body: toText(messageData.body),
  createdAt: toDate(messageData.createdAt) || null,
});

export function normalizeMessageThread(threadData, id) {
  const messages = Array.isArray(threadData.messages)
    ? threadData.messages.map((message, index) => normalizeMessage(message, index))
    : [];

  const updatedAt =
    toDate(threadData.lastMessageAt) ||
    toDate(threadData.updatedAt) ||
    messages[messages.length - 1]?.createdAt ||
    null;

  return {
    id: id || threadData.id,
    jobId: threadData.jobId || null,
    jobTitle: toText(threadData.jobTitle, "Untitled job discussion"),
    jobBudget: Number(threadData.jobBudget || threadData.budget || 0),
    clientName: toText(threadData.clientName || threadData.posterName, "Job poster"),
    workerName: toText(threadData.workerName, "Interested worker"),
    status: threadData.status || threadData.state || "open",
    state: threadData.state || threadData.status || "open",
    participantIds: Array.isArray(threadData.participantIds) ? threadData.participantIds : [],
    applicationId: threadData.applicationId || null,
    posterId: threadData.posterId || null,
    workerId: threadData.workerId || null,
    lastMessagePreview: toText(threadData.lastMessagePreview, messages[messages.length - 1]?.body || ""),
    source: threadData.source || "firestore",
    updatedAt,
    messages,
  };
}

export function buildJobMessageThreadDraft(job, worker = {}) {
  return {
    jobId: job?.id || null,
    jobTitle: job?.title || "Untitled job",
    jobBudget: Number(job?.budget || 0),
    clientName: job?.client || "Job poster",
    workerName: worker.name || worker.displayName || worker.email || "Interested worker",
    status: "open",
    source: "job_discussion",
    updatedAt: new Date(),
    messages: [
      {
        id: `intro-${Date.now()}`,
        authorId: worker.uid || null,
        authorName: worker.name || worker.displayName || "Interested worker",
        authorRole: "worker",
        body: `Hi, I am interested in discussing "${job?.title || "this job"}".`,
        createdAt: new Date(),
      },
    ],
  };
}

export async function getAllMessageThreads(user = null, mockThreads = demoMessageThreads) {
  const fallbackThreads = mockThreads.map((thread) => normalizeMessageThread(thread, thread.id));

  if (!db) {
    return fallbackThreads;
  }

  if (!user?.uid) {
    return [];
  }

  try {
    const threadsQuery = query(
      collection(db, "messageThreads"),
      where("participantIds", "array-contains", user.uid)
    );
    const snapshot = await withReadTimeout(getDocs(threadsQuery), "Fetching message threads");
    const cloudThreads = snapshot.docs
      .map((threadDoc) => normalizeMessageThread(threadDoc.data(), threadDoc.id))
      .sort(
        (firstThread, secondThread) =>
          new Date(secondThread.updatedAt || 0).getTime() -
          new Date(firstThread.updatedAt || 0).getTime()
      );

    return cloudThreads;
  } catch (error) {
    console.error("Error fetching message threads:", error);
    return [];
  }
}

export async function getMessageThreadById(threadId, user = null, mockThreads = demoMessageThreads) {
  const fallbackThread = mockThreads.find((thread) => String(thread.id) === String(threadId));

  if (!db) {
    return fallbackThread ? normalizeMessageThread(fallbackThread, fallbackThread.id) : null;
  }

  try {
    const threadSnap = await withReadTimeout(
      getDoc(doc(db, "messageThreads", threadId)),
      "Fetching message thread"
    );

    if (threadSnap.exists()) {
      const thread = normalizeMessageThread(threadSnap.data(), threadSnap.id);

      if (thread.participantIds.length && (!user?.uid || !thread.participantIds.includes(user.uid))) {
        return null;
      }

      const messagesQuery = query(
        collection(db, "messageThreads", threadId, "messages"),
        orderBy("createdAt", "asc")
      );
      const messagesSnapshot = await withReadTimeout(getDocs(messagesQuery), "Fetching messages");
      const messages = messagesSnapshot.docs.map((messageDoc, index) =>
        normalizeMessage({ id: messageDoc.id, ...messageDoc.data() }, index)
      );

      return { ...thread, messages };
    }
  } catch (error) {
    console.error("Error fetching message thread:", error);
  }

  return fallbackThread ? normalizeMessageThread(fallbackThread, fallbackThread.id) : null;
}

export async function addMessageToThread(threadId, messageData) {
  if (!messageData?.body?.trim()) {
    return { success: false, error: "Message cannot be empty." };
  }

  try {
    const response = await authFetch(`/api/messages/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: messageData.body }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Could not send this message." };
    }

    return {
      success: true,
      message: normalizeMessage(result.message),
    };
  } catch (error) {
    console.error("Error adding message:", error);
    return { success: false, error: error.message };
  }
}
