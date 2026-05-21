"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  Loader2,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users,
  MessageCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  applicationStatuses,
  getPosterJobsWithApplications,
  updateJobApplicationStatus,
} from "@/lib/jobs";

const actionConfig = [
  { status: "shortlisted", label: "Shortlist", icon: UserCheck, className: "bg-blue-600 text-white" },
  { status: "accepted", label: "Accept", icon: CheckCircle, className: "bg-green-600 text-white" },
  { status: "completed", label: "Complete", icon: CheckCircle, className: "bg-kasi-dark text-white" },
  { status: "rejected", label: "Reject", icon: UserMinus, className: "bg-red-600 text-white" },
];

const statusStyles = {
  interested: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const terminalApplicationStatuses = new Set(["rejected", "completed"]);

const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  return `RM ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

const countApplicants = (applications) => {
  if (applications.length === 1) return "1 applicant";
  return `${applications.length} applicants`;
};

export default function ManageJobsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPostedJobs() {
      try {
        const authUser = await getCurrentUser();

        if (!authUser) {
          if (isMounted) {
            setMessage("Log in to review applicants for jobs you posted.");
            setLoading(false);
          }
          return;
        }

        const jobs = await getPosterJobsWithApplications(authUser);
        if (isMounted) {
          setCurrentUser(authUser);
          setPostedJobs(jobs);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading posted jobs:", error);
        if (isMounted) {
          setMessage("Could not load posted jobs right now.");
          setLoading(false);
        }
      }
    }

    loadPostedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (jobId, applicationId, status) => {
    setUpdatingApplicationId(applicationId);
    setMessage("");

    try {
      const result = await updateJobApplicationStatus(applicationId, status, currentUser);

      if (!result.success) {
        setMessage(result.error || "Could not update this applicant.");
        return;
      }

      setPostedJobs((currentJobs) =>
        currentJobs.map((job) => {
          if (job.id !== jobId) return job;

          return {
            ...job,
            status: result.jobStatus || job.status,
            applications: job.applications.map((application) =>
              application.id === applicationId
                ? {
                    ...application,
                    status,
                    reviewStatus: `poster_${status}`,
                    messagingState:
                      result.messagingState ||
                      (status === "rejected" || status === "completed" ? "closed" : "open"),
                    messageThreadId: result.messageThreadId || null,
                    updatedAt: new Date(),
                  }
                : result.jobStatus === "matched" &&
                    application.status === "shortlisted" &&
                    application.messagingState === "open"
                  ? {
                      ...application,
                      messagingState: "closed",
                      updatedAt: new Date(),
                    }
                  : application
            ),
          };
        })
      );
    } catch (error) {
      console.error("Error updating applicant:", error);
      setMessage("Could not update this applicant.");
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 pb-5 pt-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/jobs" className="mb-4 inline-flex text-kasi-dark">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
                <Users size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-kasi-dark">Manage Posted Jobs</h1>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Review applicants and mark a beta status without opening a larger admin panel.
                </p>
              </div>
            </div>
            <Link
              href="/jobs/post"
              className="inline-flex items-center justify-center rounded-xl bg-kasi-gold px-4 py-3 text-sm font-black text-kasi-dark"
            >
              Post a job
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-6">
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-yellow-700" size={20} />
            <p className="text-xs leading-relaxed text-yellow-900">
              These actions only update beta application status. They do not create contracts, payments, escrow, Stripe records, or private production chat.
            </p>
          </div>
        </div>

        {message ? (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
            <p className="mt-3 text-sm font-bold text-gray-500">Loading posted jobs...</p>
          </div>
        ) : postedJobs.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Briefcase className="mx-auto text-gray-300" size={40} />
            <h2 className="mt-4 text-lg font-black text-kasi-dark">No posted jobs yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Jobs you post for review will appear here with their applicants.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {postedJobs.map((job) => (
              <section key={job.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                      {job.category} / {job.status === "review" ? "Posted for review" : "Open beta"}
                    </p>
                    <Link href={`/jobs/${job.id}`} className="mt-1 block text-xl font-black text-kasi-dark">
                      {job.title}
                    </Link>
                    <p className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Clock size={13} />
                      {formatBudget(job.budget)} / {countApplicants(job.applications)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {job.applications.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm font-bold text-gray-500">
                      No applicants yet.
                    </div>
                  ) : (
                    job.applications.map((application) => {
                      const status = applicationStatuses[application.status] || applicationStatuses.interested;
                      const isSelfApplication =
                        application.applicantId === currentUser?.uid || application.applicantId === job.posterId;

                      return (
                        <div key={application.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-black text-kasi-dark">{application.applicantName}</h3>
                              <p className="mt-1 text-xs font-bold text-gray-500">
                                {application.applicantEmail || "No applicant email"}
                              </p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                Ref {application.id}
                              </p>
                            </div>
                            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black ${statusStyles[application.status] || statusStyles.interested}`}>
                              {status.label}
                            </span>
                          </div>

                          {application.messageThreadId ? (
                            <Link
                              href={`/messages/${application.messageThreadId}`}
                              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-kasi-dark"
                            >
                              <MessageCircle size={16} />
                              {application.messagingState === "closed" ? "View closed conversation" : "Open conversation"}
                            </Link>
                          ) : null}

                          {isSelfApplication ? (
                            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs font-bold text-yellow-800">
                              You posted this job, so you cannot review your own application.
                            </div>
                          ) : null}

                          <div className="mt-4 grid gap-2 sm:grid-cols-4">
                            {actionConfig.map((action) => {
                              const Icon = action.icon;
                              const isCurrentStatus = application.status === action.status;
                              const isUpdating = updatingApplicationId === application.id;
                              const isCompleteBlocked = action.status === "completed" && application.status !== "accepted";
                              const isAcceptedOnlyComplete =
                                application.status === "accepted" && action.status !== "completed";
                              const isTerminal = terminalApplicationStatuses.has(application.status);
                              const isMatchedBlocked =
                                job.status === "matched" &&
                                application.status !== "accepted" &&
                                action.status !== "completed";

                              return (
                                <button
                                  key={action.status}
                                  type="button"
                                  onClick={() => handleStatusUpdate(job.id, application.id, action.status)}
                                  disabled={
                                    isCurrentStatus ||
                                    isUpdating ||
                                    isCompleteBlocked ||
                                    isAcceptedOnlyComplete ||
                                    isTerminal ||
                                    isMatchedBlocked ||
                                    isSelfApplication
                                  }
                                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${action.className}`}
                                >
                                  {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Icon size={16} />}
                                  {isCurrentStatus ? status.label : action.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
