import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";
import {
  getSkillLevel,
  getThreadIdForApplication,
  isMessagingUnlockedStatus,
  normalizePrimarySkillTag,
} from "@/lib/marketplaceLogic.mjs";

export class JobApplicationActionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "JobApplicationActionError";
    this.status = status;
  }
}

const POSTER_ACTIONS = new Set(["shortlist", "accept", "reject", "complete"]);
const TERMINAL_APPLICATION_STATUSES = new Set(["rejected", "completed"]);

function getParticipantName(value, fallback) {
  return String(value || fallback || "KasiJobs user").trim();
}

function buildThreadPayload(application, job, threadId) {
  const posterId = application.posterId;
  const workerId = application.applicantId;

  return {
    type: "job_application",
    jobId: application.jobId,
    applicationId: application.id,
    posterId,
    workerId,
    participantIds: [posterId, workerId],
    participants: {
      [posterId]: {
        role: "poster",
        displayName: getParticipantName(job.client || job.posterEmail, "Job poster"),
      },
      [workerId]: {
        role: "worker",
        displayName: getParticipantName(application.applicantName || application.applicantEmail, "Worker"),
      },
    },
    jobTitle: application.jobTitle || job.title || "Untitled job",
    jobBudget: Number(job.budget || 0),
    state: "open",
    updatedAt: FieldValue.serverTimestamp(),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessageAuthorId: null,
    lastMessagePreview: "Conversation opened for this application.",
    threadId,
  };
}

function applyThreadOpen(transaction, threadRef, application, job, threadId) {
  transaction.set(
    threadRef,
    {
      ...buildThreadPayload(application, job, threadId),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

function closeThread(transaction, db, threadId) {
  if (!threadId) return;

  transaction.set(
    db.collection("messageThreads").doc(threadId),
    {
      state: "closed",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function getAcceptedApplications(transaction, db, jobId) {
  const acceptedQuery = db
    .collection("jobApplications")
    .where("jobId", "==", jobId)
    .where("status", "==", "accepted");
  const acceptedSnapshot = await transaction.get(acceptedQuery);
  return acceptedSnapshot.docs;
}

async function getSkillProgressUpdate(transaction, db, application, job) {
  const workerRef = db.collection("users").doc(application.applicantId);
  const workerSnapshot = await transaction.get(workerRef);
  const userData = workerSnapshot.exists ? workerSnapshot.data() : {};
  const skillProgress = { ...(userData.skillProgress || {}) };
  const skillTag = normalizePrimarySkillTag(job.primarySkillTag || application.primarySkillTag || job.category);
  const currentSkill = skillProgress[skillTag] || {};
  const completedCount = Number(currentSkill.completedCount || 0) + 1;

  return {
    workerRef,
    skillTag,
    skillProgress: {
      ...skillProgress,
      [skillTag]: {
        completedCount,
        level: getSkillLevel(completedCount),
        lastCompletedAt: FieldValue.serverTimestamp(),
      },
    },
  };
}

export async function updateJobApplicationStatusForPoster(applicationId, action, posterUid) {
  if (!applicationId || !POSTER_ACTIONS.has(action)) {
    throw new JobApplicationActionError("Choose a valid application action.", 400);
  }

  const db = await getFirebaseAdminDb();
  const applicationRef = db.collection("jobApplications").doc(applicationId);

  return db.runTransaction(async (transaction) => {
    const applicationSnapshot = await transaction.get(applicationRef);

    if (!applicationSnapshot.exists) {
      throw new JobApplicationActionError("Application does not exist.", 404);
    }

    const application = { id: applicationSnapshot.id, ...applicationSnapshot.data() };

    if (application.posterId !== posterUid) {
      throw new JobApplicationActionError("Only the job poster can review this application.", 403);
    }

    if (application.posterId === application.applicantId) {
      throw new JobApplicationActionError("Posters cannot message or review themselves.", 400);
    }

    const jobRef = db.collection("jobs").doc(application.jobId);
    const jobSnapshot = await transaction.get(jobRef);

    if (!jobSnapshot.exists) {
      throw new JobApplicationActionError("Job does not exist.", 404);
    }

    const job = jobSnapshot.data();
    const existingThreadId = application.messageThreadId || null;
    const threadId = existingThreadId || getThreadIdForApplication(applicationId);
    const threadRef = db.collection("messageThreads").doc(threadId);

    if (TERMINAL_APPLICATION_STATUSES.has(application.status)) {
      throw new JobApplicationActionError("This application is already closed.", 409);
    }

    if (job.status === "completed") {
      throw new JobApplicationActionError("Completed jobs cannot be changed.", 409);
    }

    if (application.status === "accepted" && action !== "complete") {
      throw new JobApplicationActionError("Accepted applications can only be completed in this pass.", 409);
    }

    if (job.status === "matched" && action !== "complete") {
      throw new JobApplicationActionError("Matched jobs cannot accept or reopen other applicants.", 409);
    }

    const acceptedApplications = await getAcceptedApplications(transaction, db, application.jobId);
    const otherAccepted = acceptedApplications.find((docSnapshot) => docSnapshot.id !== applicationId);
    const shortlistedApplications =
      action === "accept"
        ? await (async () => {
            const shortlistedQuery = db
              .collection("jobApplications")
              .where("jobId", "==", application.jobId)
              .where("status", "==", "shortlisted");
            const shortlistedSnapshot = await transaction.get(shortlistedQuery);
            return shortlistedSnapshot.docs;
          })()
        : [];
    const skillUpdate =
      action === "complete"
        ? await getSkillProgressUpdate(transaction, db, application, job)
        : null;
    const nowUpdate = {
      updatedAt: FieldValue.serverTimestamp(),
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: posterUid,
    };

    if (action === "complete") {
      if (application.status !== "accepted") {
        throw new JobApplicationActionError("Only accepted applications can be completed.", 400);
      }

      transaction.update(applicationRef, {
        status: "completed",
        reviewStatus: "poster_completed",
        messagingState: "closed",
        completedAt: FieldValue.serverTimestamp(),
        ...nowUpdate,
      });
      transaction.update(jobRef, {
        status: "completed",
        completedApplicationId: applicationId,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      closeThread(transaction, db, threadId);
      transaction.set(skillUpdate.workerRef, { skillProgress: skillUpdate.skillProgress }, { merge: true });

      return {
        success: true,
        status: "completed",
        jobStatus: "completed",
        messagingState: "closed",
        messageThreadId: threadId,
        skillTag: skillUpdate.skillTag,
      };
    }

    if (action === "reject") {
      transaction.update(applicationRef, {
        status: "rejected",
        reviewStatus: "poster_rejected",
        messagingState: "closed",
        messageThreadId: existingThreadId,
        ...nowUpdate,
      });
      closeThread(transaction, db, existingThreadId);

      return {
        success: true,
        status: "rejected",
        messagingState: "closed",
        messageThreadId: existingThreadId,
      };
    }

    if (otherAccepted) {
      throw new JobApplicationActionError("This job already has an accepted worker.", 409);
    }

    const nextStatus = action === "accept" ? "accepted" : "shortlisted";

    applyThreadOpen(transaction, threadRef, application, job, threadId);
    transaction.update(applicationRef, {
      status: nextStatus,
      reviewStatus: `poster_${nextStatus}`,
      messagingState: isMessagingUnlockedStatus(nextStatus) ? "open" : "locked",
      messageThreadId: threadId,
      primarySkillTag: normalizePrimarySkillTag(job.primarySkillTag || application.primarySkillTag || job.category),
      ...nowUpdate,
    });

    if (action === "accept") {
      transaction.update(jobRef, {
        status: "matched",
        acceptedApplicationId: applicationId,
        matchedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      shortlistedApplications.forEach((applicationDoc) => {
        if (applicationDoc.id === applicationId) return;

        const shortlistedApplication = applicationDoc.data();
        transaction.update(applicationDoc.ref, {
          messagingState: "closed",
          updatedAt: FieldValue.serverTimestamp(),
        });
        closeThread(transaction, db, shortlistedApplication.messageThreadId);
      });
    }

    return {
      success: true,
      status: nextStatus,
      jobStatus: action === "accept" ? "matched" : job.status,
      messagingState: "open",
      messageThreadId: threadId,
    };
  });
}

export async function sendThreadMessage(threadId, senderUid, body) {
  const messageBody = String(body || "").trim();

  if (!threadId) {
    throw new JobApplicationActionError("Missing thread id.", 400);
  }

  if (!messageBody) {
    throw new JobApplicationActionError("Message cannot be empty.", 400);
  }

  if (messageBody.length > 1000) {
    throw new JobApplicationActionError("Message is too long.", 400);
  }

  const db = await getFirebaseAdminDb();
  const threadRef = db.collection("messageThreads").doc(threadId);
  const messageRef = threadRef.collection("messages").doc();

  return db.runTransaction(async (transaction) => {
    const threadSnapshot = await transaction.get(threadRef);

    if (!threadSnapshot.exists) {
      throw new JobApplicationActionError("Thread does not exist.", 404);
    }

    const thread = threadSnapshot.data();

    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(senderUid)) {
      throw new JobApplicationActionError("You are not part of this conversation.", 403);
    }

    if (thread.state !== "open") {
      throw new JobApplicationActionError("This conversation is closed.", 400);
    }

    const participant = thread.participants?.[senderUid] || {};
    const message = {
      authorId: senderUid,
      authorRole: participant.role || "participant",
      authorName: participant.displayName || "KasiJobs user",
      body: messageBody,
      kind: "text",
      createdAt: FieldValue.serverTimestamp(),
    };

    transaction.set(messageRef, message);
    transaction.update(threadRef, {
      updatedAt: FieldValue.serverTimestamp(),
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageAuthorId: senderUid,
      lastMessagePreview: messageBody.slice(0, 140),
    });

    return {
      id: messageRef.id,
      ...message,
      createdAt: new Date(),
    };
  });
}
