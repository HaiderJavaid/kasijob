"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  applicationStatuses,
  canApplyToJob,
  getJobApplicationStatus,
  getJobById,
  submitJobApplication,
} from "@/lib/jobs";

const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  return `RM ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

const formatDate = (createdAt) => {
  if (!createdAt) return "Beta listing";

  try {
    return new Intl.DateTimeFormat("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(createdAt));
  } catch {
    return "Beta listing";
  }
};

export default function JobDetailsPage() {
  const params = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({ applied: false });
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState("");

  const appliedStatus =
    applicationStatuses[applicationStatus.status] || applicationStatuses.interested;
  const isOwnJob = Boolean(currentUser?.uid && job?.posterId && currentUser.uid === job.posterId);
  const canApply = canApplyToJob(job, currentUser);
  const hasOpenThread = applicationStatus.messageThreadId && applicationStatus.messagingState === "open";

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      const [selectedJob, authUser] = await Promise.all([getJobById(params.id), getCurrentUser()]);
      const selectedApplicationStatus =
        selectedJob && authUser
          ? await getJobApplicationStatus(selectedJob.id, authUser)
          : { applied: false };

      if (isMounted) {
        setJob(selectedJob);
        setCurrentUser(authUser);
        setApplicationStatus(selectedApplicationStatus);
        setLoading(false);
      }
    }

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleApply = async () => {
    setApplyLoading(true);
    setMessage("");

    try {
      const authUser = currentUser || (await getCurrentUser());

      if (!authUser) {
        setMessage("Log in to register interest for this job.");
        return;
      }

      const result = await submitJobApplication(job, authUser);

      if (!result.success) {
        setMessage(result.error || "Could not register interest right now.");
        return;
      }

      setCurrentUser(authUser);
      setApplicationStatus({
        applied: true,
        applicationId: result.applicationId,
        source: result.source,
        status: result.status || "interested",
        messageThreadId: result.messageThreadId || null,
        messagingState: result.messagingState || "locked",
      });
      setMessage(
        result.duplicate
          ? "You already registered interest for this job."
          : "Interest registered. KasiJobs can review this beta application next."
      );
    } catch (error) {
      console.error("Error registering interest:", error);
      setMessage("Could not register interest right now.");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kasi-gray font-sans">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
          <p className="mt-3 text-sm font-bold text-gray-500">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-kasi-gray px-6 py-10 font-sans">
        <Link href="/jobs" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-kasi-dark">
          <ArrowLeft size={18} />
          Back to jobs
        </Link>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <Briefcase className="mx-auto text-gray-300" size={40} />
          <h1 className="mt-4 text-xl font-black text-kasi-dark">Job not found</h1>
          <p className="mt-2 text-sm text-gray-500">This beta listing may have been removed or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <section className="relative rounded-b-[2rem] bg-kasi-dark px-6 pb-10 pt-10 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/jobs"
            className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-kasi-gold">
            <ShieldCheck size={14} />
            {job.status === "review" ? "Posted for review" : "Open marketplace beta"}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-kasi-subtle">{job.category}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-gray-300">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={15} />
                  {job.locationType}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={15} />
                  {formatDate(job.createdAt)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 text-kasi-dark shadow-lg sm:text-right">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Listed budget</p>
              <p className="mt-1 text-2xl font-black">{formatBudget(job.budget)}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 py-6">
        <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-yellow-700" size={20} />
            <div>
              <h2 className="text-sm font-black text-yellow-950">Review before real matching</h2>
              <p className="mt-1 text-xs leading-relaxed text-yellow-900">
                This listing can collect worker interest for admin review. The discussion link is only a demo hook and does not start payment, escrow, Stripe, or a contract.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-black text-kasi-dark">Job Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{job.description}</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-kasi-dark">Requirements</h2>
            {job.requirements.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {job.requirements.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-3 text-sm leading-relaxed text-gray-600">
                    <CheckCircle className="mt-0.5 shrink-0 text-kasi-gold" size={16} />
                    {requirement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No special requirements were added.</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex gap-3">
              <UserCheck className="mt-0.5 shrink-0 text-kasi-dark" size={22} />
              <div>
                <h2 className="text-sm font-black text-kasi-dark">Client</h2>
                <p className="mt-1 text-sm text-gray-600">{job.client}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="mt-0.5 shrink-0 text-green-700" size={22} />
              <div>
                <h2 className="text-sm font-black text-green-950">Application status</h2>
                <p className="mt-1 text-sm leading-relaxed text-green-800">
                  {applicationStatus.applied
                    ? `${appliedStatus.label}. ${appliedStatus.description}`
                    : "Open for interest. Logged-in users can register without starting a payment or message thread."}
                </p>
                {applicationStatus.applicationId ? (
                  <p className="mt-2 text-xs font-bold text-green-700">
                    Application ref: {applicationStatus.applicationId}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-5">
        <div className="mx-auto max-w-3xl">
          {message ? (
            <p className="mb-3 rounded-xl bg-gray-100 px-3 py-2 text-center text-xs font-bold text-gray-600">
              {message}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {!applicationStatus.applied ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={applyLoading || !canApply}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-kasi-dark py-4 font-black text-white shadow-lg transition hover:bg-black active:scale-95"
              >
                {applyLoading ? <Loader2 size={20} className="animate-spin" /> : <UserCheck size={20} />}
                {applyLoading ? "Registering..." : isOwnJob ? "Your posted job" : job.status === "matched" || job.status === "completed" ? "Job no longer accepting" : "Apply / Register Interest"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-4 font-black text-white"
              >
                <CheckCircle size={20} />
                {appliedStatus.label}
              </button>
            )}
            {hasOpenThread ? (
              <Link
                href={`/messages/${applicationStatus.messageThreadId}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 font-black text-kasi-dark shadow-sm transition active:scale-95"
              >
                <MessageCircle size={20} />
                Open Conversation
              </Link>
            ) : null}
            <Link
              href="/jobs/applications"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 font-black text-kasi-dark shadow-sm transition active:scale-95 sm:col-span-2"
            >
              <FileText size={20} />
              My Application Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
