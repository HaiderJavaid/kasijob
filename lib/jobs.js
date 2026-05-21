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
  updateDoc,
  where,
} from "firebase/firestore";

export const betaJobs = [
  {
    id: "sample-logo-cafe",
    title: "Design a logo for a cafe",
    budget: 50,
    locationType: "Remote",
    category: "Design",
    client: "Kopi Satu",
    description:
      "Create a clean logo concept for a small cafe brand. The prototype listing is here so earners and admins can test the marketplace flow.",
    requirements: ["Share 2 concept directions", "Include PNG export", "Can revise once"],
    status: "open",
    source: "sample",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "sample-translate-assignment",
    title: "Translate Malay notes to English",
    budget: 30,
    locationType: "Remote",
    category: "Writing",
    client: "Student Ali",
    description:
      "Translate short study notes into clear English. This is a controlled sample used to shape how real job posts should read.",
    requirements: ["Good Malay and English", "Keep formatting simple", "No machine-only translation"],
    status: "open",
    source: "sample",
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
  },
  {
    id: "sample-event-helper",
    title: "Help set up a weekend booth",
    budget: 120,
    locationType: "On-Site (KL)",
    category: "Event",
    client: "KasiJobs Beta",
    description:
      "Assist with booth setup, simple packing, and guest flow. Real on-site work needs admin review before earners are matched.",
    requirements: ["Available Saturday morning", "Comfortable with light lifting", "Punctual"],
    status: "open",
    source: "sample",
    createdAt: new Date("2026-01-03T00:00:00.000Z"),
  },
];

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
  rejected: {
    label: "Rejected",
    tone: "red",
    description: "The poster is not moving forward with this application.",
  },
};

export const posterReviewStatuses = ["shortlisted", "accepted", "rejected"];

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
    client: jobData.client || jobData.posterName || "KasiJobs beta client",
    description: jobData.description || jobData.desc || "",
    requirements: splitRequirements(jobData.requirements || jobData.reqText),
    status: jobData.status || "review",
    source: jobData.source || "firestore",
    posterId: jobData.posterId || null,
    posterEmail: jobData.posterEmail || null,
    createdAt: createdAt || null,
  };
}

export function buildJobApplication(job, user) {
  const userId = user?.uid;
  const jobId = job?.id;

  if (!jobId || !userId) {
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
    status: "interested",
    reviewStatus: "admin_reviewed_beta",
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
    status,
    reviewStatus: applicationData.reviewStatus || "poster_review_pending",
    source: applicationData.source || "firestore",
    createdAt: createdAt || null,
    updatedAt: updatedAt || null,
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

export async function getAllJobs(mockJobs = betaJobs) {
  const fallbackJobs = mockJobs.map((job) => normalizeJob(job, job.id));

  if (!db) {
    return fallbackJobs;
  }

  try {
    const jobsRef = collection(db, "jobs");
    const jobsQuery = query(jobsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(jobsQuery);

    const cloudJobs = snapshot.docs.map((jobDoc) => normalizeJob(jobDoc.data(), jobDoc.id));
    return [...cloudJobs, ...fallbackJobs];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return fallbackJobs;
  }
}

export async function getJobById(jobId, mockJobs = betaJobs) {
  const fallbackJob = mockJobs.find((job) => String(job.id) === String(jobId));

  if (!db) {
    return fallbackJob ? normalizeJob(fallbackJob, fallbackJob.id) : null;
  }

  try {
    const jobSnap = await getDoc(doc(db, "jobs", jobId));

    if (jobSnap.exists()) {
      return normalizeJob(jobSnap.data(), jobSnap.id);
    }
  } catch (error) {
    console.error("Error fetching job:", error);
  }

  return fallbackJob ? normalizeJob(fallbackJob, fallbackJob.id) : null;
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

    const cloudIds = new Set(cloudApplications.map((application) => application.id));
    const uniqueDemoApplications = demoApplications.filter((application) => !cloudIds.has(application.id));

    return [...cloudApplications, ...uniqueDemoApplications].sort(
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

  const demoApplications = readAllDemoApplications()
    .filter((application) => application.posterId === user.uid)
    .map((application) => normalizeJobApplication(application, application.id));

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

    const applicationsByJob = [...cloudApplications, ...demoApplications].reduce((groups, application) => {
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
      updatedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: user.uid,
    };
    saveDemoApplication(updatedApplication);
    return { success: true, application: normalizeJobApplication(updatedApplication, updatedApplication.id) };
  }

  try {
    await updateDoc(doc(db, "jobApplications", applicationId), {
      status,
      reviewStatus: `poster_${status}`,
      updatedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: user.uid,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating job application:", error);
    return { success: false, error: "Could not update this application status." };
  }
}

export async function submitJobApplication(job, user) {
  const application = buildJobApplication(job, user);

  if (!application) {
    return { success: false, error: "Please log in before registering interest." };
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
    saveDemoApplication({ ...application, id: docRef.id, source: "firestore" });

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
