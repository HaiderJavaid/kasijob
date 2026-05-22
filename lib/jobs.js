import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { authFetch, getAuthDebugInfo } from "@/lib/client/auth";
import {
  canApplyToJob,
  normalizePrimarySkillTag,
  SKILL_TAGS,
} from "@/lib/marketplaceLogic.mjs";

const splitRequirements = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split("\n")
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
};

const readBudget = (jobData) => {
  const amount = Number(jobData.budget ?? jobData.price ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const getDemoApplicationKey = (jobId, userId) => `kasi_job_interest_${jobId}_${userId}`;

const getSessionApplicationKey = (jobId, userId) => `kasi_job_interest_session_${jobId}_${userId}`;

const statusActionMap = {
  shortlisted: "shortlist",
  accepted: "accept",
  rejected: "reject",
  completed: "complete",
};

export const applicationStatuses = {
  interested: {
    label: "Interested",
    tone: "yellow",
    description: "Application received and waiting for poster review.",
  },
  shortlisted: {
    label: "Shortlisted",
    tone: "blue",
    description: "The poster marked this applicant as a strong fit.",
  },
  accepted: {
    label: "Accepted",
    tone: "green",
    description: "The poster selected this applicant for the beta match.",
  },
  completed: {
    label: "Completed",
    tone: "green",
    description: "The poster marked this job complete, and your skill tag has progressed.",
  },
  rejected: {
    label: "Rejected",
    tone: "red",
    description: "The poster is not moving forward with this application.",
  },
};

export { canApplyToJob, SKILL_TAGS };

export const posterReviewStatuses = ["shortlisted", "accepted", "rejected", "completed"];

const readDemoApplication = (jobId, userId) => {
  if (typeof window === "undefined" || !jobId || !userId) return null;

  try {
    const storedApplication = window.localStorage.getItem(getDemoApplicationKey(jobId, userId));
    return storedApplication ? JSON.parse(storedApplication) : null;
  } catch (error) {
    console.warn("Could not read demo job application:", error);
    return null;
  }
};

const readAllDemoApplications = () => {
  if (typeof window === "undefined") return [];

  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith("kasi_job_interest_"))
      .filter((key) => !key.startsWith("kasi_job_interest_session_"))
      .map((key) => JSON.parse(window.localStorage.getItem(key)))
      .filter((application) => application?.jobId && application?.applicantId);
  } catch (error) {
    console.warn("Could not read demo job applications:", error);
    return [];
  }
};

const saveDemoApplication = (application) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getDemoApplicationKey(application.jobId, application.applicantId),
      JSON.stringify(application)
    );
    window.sessionStorage.setItem(
      getSessionApplicationKey(application.jobId, application.applicantId),
      application.id
    );
  } catch (error) {
    console.warn("Could not save demo job application:", error);
  }
};

export function normalizeJob(jobData, id) {
  const createdAt = jobData.createdAt?.toDate ? jobData.createdAt.toDate() : jobData.createdAt;

  return {
    id: id || jobData.id,
    title: String(jobData.title || "Untitled job").trim(),
    budget: readBudget(jobData),
    locationType: jobData.locationType || jobData.location || "Remote",
    category: jobData.category || "General",
    primarySkillTag: normalizePrimarySkillTag(jobData.primarySkillTag || jobData.category),
    client: jobData.client || jobData.posterName || "KasiJobs beta client",
    description: jobData.description || jobData.desc || "",
    requirements: splitRequirements(jobData.requirements || jobData.reqText),
    status: jobData.status || "review",
    source: jobData.source || "firestore",
    posterId: jobData.posterId || null,
    posterEmail: jobData.posterEmail || null,
    acceptedApplicationId: jobData.acceptedApplicationId || null,
    completedApplicationId: jobData.completedApplicationId || null,
    createdAt: createdAt || null,
  };
}

export function buildJobApplication(job, user) {
  const userId = user?.uid;
  const jobId = job?.id;

  if (!jobId || !userId || !canApplyToJob(job, user)) {
    return null;
  }

  return {
    jobId,
    jobTitle: job.title || "Untitled job",
    jobSource: job.source || "firestore",
    applicantId: userId,
    applicantEmail: user.email || null,
    applicantName: user.displayName || user.email || "KasiJobs user",
    posterId: job.posterId || null,
    primarySkillTag: normalizePrimarySkillTag(job.primarySkillTag || job.category),
    status: "interested",
    reviewStatus: "admin_reviewed_beta",
    messagingState: "locked",
    messageThreadId: null,
    createdAt: new Date(),
  };
}

export function normalizeJobApplication(applicationData, id) {
  const createdAt = applicationData.createdAt?.toDate
    ? applicationData.createdAt.toDate()
    : applicationData.createdAt;
  const updatedAt = applicationData.updatedAt?.toDate
    ? applicationData.updatedAt.toDate()
    : applicationData.updatedAt;
  const completedAt = applicationData.completedAt?.toDate
    ? applicationData.completedAt.toDate()
    : applicationData.completedAt;

  const status = applicationStatuses[applicationData.status]
    ? applicationData.status
    : "interested";

  return {
    id: id || applicationData.id,
    jobId: applicationData.jobId,
    jobTitle: applicationData.jobTitle || "Untitled job",
    jobSource: applicationData.jobSource || "firestore",
    applicantId: applicationData.applicantId || null,
    applicantEmail: applicationData.applicantEmail || null,
    applicantName: applicationData.applicantName || "KasiJobs user",
    posterId: applicationData.posterId || null,
    primarySkillTag: normalizePrimarySkillTag(applicationData.primarySkillTag || applicationData.category),
    status,
    reviewStatus: applicationData.reviewStatus || "poster_review_pending",
    messagingState: applicationData.messagingState || "locked",
    messageThreadId: applicationData.messageThreadId || null,
    source: applicationData.source || "firestore",
    createdAt: createdAt || null,
    updatedAt: updatedAt || null,
    completedAt: completedAt || null,
  };
}

export async function saveJob(jobData) {
  if (!db) {
    return { success: false, error: "Firebase is not configured for this environment." };
  }

  const normalizedJob = normalizeJob(jobData);

  if (!normalizedJob.title || normalizedJob.budget < 10 || !normalizedJob.description) {
    return { success: false, error: "Please complete the required job details." };
  }

  try {
    const { id: _unusedId, ...jobToSave } = normalizedJob;
    const docRef = await addDoc(collection(db, "jobs"), {
      ...jobToSave,
      requirements: jobToSave.requirements,
      primarySkillTag: normalizePrimarySkillTag(jobToSave.primarySkillTag || jobToSave.category),
      status: "review",
      source: "admin_beta",
      createdAt: new Date(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving job:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllJobs() {
  if (!db) {
    return [];
  }

  try {
    const jobsRef = collection(db, "jobs");
    const jobsQuery = query(jobsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(jobsQuery);

    const cloudJobs = snapshot.docs.map((jobDoc) => normalizeJob(jobDoc.data(), jobDoc.id));
    return cloudJobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export async function getJobById(jobId) {
  if (!db) {
    return null;
  }

  try {
    const jobSnap = await getDoc(doc(db, "jobs", jobId));

    if (jobSnap.exists()) {
      return normalizeJob(jobSnap.data(), jobSnap.id);
    }
  } catch (error) {
    console.error("Error fetching job:", error);
  }

  return null;
}

export async function getJobApplicationStatus(jobId, user) {
  if (!jobId || !user?.uid) {
    return { applied: false };
  }

  const demoApplication = readDemoApplication(jobId, user.uid);
  if (demoApplication) {
    return {
      applied: true,
      applicationId: demoApplication.id,
      source: demoApplication.source || "demo",
      status: demoApplication.status || "interested",
      messageThreadId: demoApplication.messageThreadId || null,
      messagingState: demoApplication.messagingState || "locked",
    };
  }

  if (!db) {
    return { applied: false };
  }

  try {
    const applicationsQuery = query(
      collection(db, "jobApplications"),
      where("jobId", "==", jobId),
      where("applicantId", "==", user.uid),
      limit(1)
    );
    const snapshot = await getDocs(applicationsQuery);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const applicationData = existingDoc.data();
      return {
        applied: true,
        applicationId: existingDoc.id,
        source: "firestore",
        status: applicationData.status || "interested",
        messageThreadId: applicationData.messageThreadId || null,
        messagingState: applicationData.messagingState || "locked",
      };
    }
  } catch (error) {
    console.error("Error checking job application:", error);
  }

  return { applied: false };
}

export async function getUserJobApplications(user) {
  if (!user?.uid) {
    return [];
  }

  const demoApplications = readAllDemoApplications()
    .filter((application) => application.applicantId === user.uid)
    .map((application) => normalizeJobApplication(application, application.id));

  if (!db) {
    return demoApplications;
  }

  try {
    const applicationsQuery = query(
      collection(db, "jobApplications"),
      where("applicantId", "==", user.uid)
    );
    const snapshot = await getDocs(applicationsQuery);
    const cloudApplications = snapshot.docs.map((applicationDoc) =>
      normalizeJobApplication(applicationDoc.data(), applicationDoc.id)
    );

    return cloudApplications.sort(
      (firstApplication, secondApplication) =>
        new Date(secondApplication.createdAt || 0).getTime() -
        new Date(firstApplication.createdAt || 0).getTime()
    );
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return demoApplications;
  }
}

export async function getPosterJobsWithApplications(user) {
  if (!user?.uid) {
    return [];
  }

  if (!db) {
    return [];
  }

  try {
    const jobsQuery = query(
      collection(db, "jobs"),
      where("posterId", "==", user.uid)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    const postedJobs = jobsSnapshot.docs
      .map((jobDoc) => normalizeJob(jobDoc.data(), jobDoc.id))
      .sort(
        (firstJob, secondJob) =>
          new Date(secondJob.createdAt || 0).getTime() - new Date(firstJob.createdAt || 0).getTime()
      );

    const applicationsQuery = query(
      collection(db, "jobApplications"),
      where("posterId", "==", user.uid)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    const cloudApplications = applicationsSnapshot.docs.map((applicationDoc) =>
      normalizeJobApplication(applicationDoc.data(), applicationDoc.id)
    );

    const applicationsByJob = cloudApplications.reduce((groups, application) => {
      if (application.applicantId === application.posterId) {
        return groups;
      }

      const jobApplications = groups.get(application.jobId) || [];
      groups.set(application.jobId, [...jobApplications, application]);
      return groups;
    }, new Map());

    return postedJobs.map((job) => ({
      ...job,
      applications: applicationsByJob.get(job.id) || [],
    }));
  } catch (error) {
    console.error("Error fetching posted jobs and applications:", error);
    return [];
  }
}

export async function updateJobApplicationStatus(applicationId, status, user) {
  if (!applicationId || !posterReviewStatuses.includes(status)) {
    return { success: false, error: "Choose a valid application status." };
  }

  if (!user?.uid) {
    return { success: false, error: "Please log in before reviewing applicants." };
  }

  const demoApplications = readAllDemoApplications();
  const demoApplication = demoApplications.find((application) => application.id === applicationId);

  if (!db || demoApplication?.source === "demo") {
    if (!demoApplication) {
      return { success: false, error: "Could not find this demo application." };
    }

    const updatedApplication = {
      ...demoApplication,
      status,
      reviewStatus: `poster_${status}`,
      messagingState: status === "rejected" || status === "completed" ? "closed" : "open",
      messageThreadId:
        status === "rejected" || status === "completed"
          ? demoApplication.messageThreadId || null
          : demoApplication.messageThreadId || `demo-thread-${applicationId}`,
      updatedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: user.uid,
    };
    saveDemoApplication(updatedApplication);
    return {
      success: true,
      application: normalizeJobApplication(updatedApplication, updatedApplication.id),
      messagingState: updatedApplication.messagingState,
      messageThreadId: updatedApplication.messageThreadId,
    };
  }

  try {
    const response = await authFetch(`/api/job-applications/${applicationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: statusActionMap[status] }),
    });

    const result = await response.json();

    if (response.status === 401) {
      const authDebug = await getAuthDebugInfo();
      const projectHint =
        result.details?.tokenAudience && result.details?.adminProjectId
          ? ` Token project: ${result.details.tokenAudience}. Admin project: ${result.details.adminProjectId}.`
          : authDebug.tokenAudience || authDebug.adminProjectId
            ? ` Token project: ${authDebug.tokenAudience || "unknown"}. Admin project: ${authDebug.adminProjectId || "unknown"}. Client project: ${authDebug.clientProjectId || "unknown"}.`
          : "";

      return {
        success: false,
        error:
          `Your sign-in session could not be verified. Sign out and back in, then confirm the Firebase client and Admin project IDs match.${projectHint}`,
      };
    }

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Could not update this application status." };
    }

    return result;
  } catch (error) {
    console.error("Error updating job application:", error);
    return { success: false, error: "Could not update this application status." };
  }
}

export async function deletePostedJob(jobId, user) {
  if (!jobId) {
    return { success: false, error: "Missing job id." };
  }

  if (!user?.uid) {
    return { success: false, error: "Please log in before deleting jobs." };
  }

  try {
    const response = await authFetch(`/api/jobs/${jobId}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (response.status === 401) {
      const authDebug = await getAuthDebugInfo();
      const projectHint =
        result.details?.tokenAudience && result.details?.adminProjectId
          ? ` Token project: ${result.details.tokenAudience}. Admin project: ${result.details.adminProjectId}.`
          : authDebug.tokenAudience || authDebug.adminProjectId
            ? ` Token project: ${authDebug.tokenAudience || "unknown"}. Admin project: ${authDebug.adminProjectId || "unknown"}. Client project: ${authDebug.clientProjectId || "unknown"}.`
          : "";

      return {
        success: false,
        error:
          `Your sign-in session could not be verified. Sign out and back in, then confirm the Firebase client and Admin project IDs match.${projectHint}`,
      };
    }

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Could not delete this job." };
    }

    return result;
  } catch (error) {
    console.error("Error deleting posted job:", error);
    return { success: false, error: "Could not delete this job." };
  }
}

export async function submitJobApplication(job, user) {
  const application = buildJobApplication(job, user);

  if (!application) {
    return { success: false, error: job?.posterId === user?.uid ? "You cannot apply to your own job." : "Please log in before registering interest." };
  }

  const existingApplication = await getJobApplicationStatus(application.jobId, user);
  if (existingApplication.applied) {
    return {
      success: true,
      duplicate: true,
      applicationId: existingApplication.applicationId,
      source: existingApplication.source,
      status: existingApplication.status,
    };
  }

  if (!db) {
    const demoApplication = {
      ...application,
      id: `demo-${application.jobId}-${application.applicantId}`,
      source: "demo",
    };
    saveDemoApplication(demoApplication);

    return {
      success: true,
      applicationId: demoApplication.id,
      source: "demo",
      status: demoApplication.status,
    };
  }

  try {
    const docRef = await addDoc(collection(db, "jobApplications"), application);

    return {
      success: true,
      applicationId: docRef.id,
      source: "firestore",
      status: application.status,
    };
  } catch (error) {
    console.error("Error submitting job application:", error);

    if (job.source === "sample") {
      const demoApplication = {
        ...application,
        id: `demo-${application.jobId}-${application.applicantId}`,
        source: "demo",
      };
      saveDemoApplication(demoApplication);

      return {
        success: true,
        applicationId: demoApplication.id,
        source: "demo",
        status: demoApplication.status,
      };
    }

    return { success: false, error: "Could not register interest right now." };
  }
}
