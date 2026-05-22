import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/server/firebaseAdmin";

export class JobActionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "JobActionError";
    this.status = status;
  }
}

export async function deletePostedJobForPoster(jobId, posterUid) {
  if (!jobId) {
    throw new JobActionError("Missing job id.", 400);
  }

  const db = await getFirebaseAdminDb();
  const jobRef = db.collection("jobs").doc(jobId);
  const jobSnapshot = await jobRef.get();

  if (!jobSnapshot.exists) {
    throw new JobActionError("Job does not exist.", 404);
  }

  const job = jobSnapshot.data();

  if (job.posterId !== posterUid) {
    throw new JobActionError("Only the job poster can delete this job.", 403);
  }

  if (job.status === "matched" || job.status === "completed") {
    throw new JobActionError("Matched or completed jobs cannot be deleted.", 409);
  }

  const applicationsSnapshot = await db
    .collection("jobApplications")
    .where("jobId", "==", jobId)
    .get();
  const batch = db.batch();

  applicationsSnapshot.docs.forEach((applicationDoc) => {
    const application = applicationDoc.data();

    if (application.messageThreadId) {
      batch.set(
        db.collection("messageThreads").doc(application.messageThreadId),
        {
          state: "closed",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    batch.delete(applicationDoc.ref);
  });

  batch.delete(jobRef);
  await batch.commit();

  return { success: true, deletedApplications: applicationsSnapshot.size };
}
