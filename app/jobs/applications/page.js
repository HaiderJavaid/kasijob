"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { applicationStatuses, getUserJobApplications } from "@/lib/jobs";

const statusStyles = {
  interested: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const formatDate = (value) => {
  if (!value) return "Recently";

  try {
    return new Intl.DateTimeFormat("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Recently";
  }
};

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      try {
        const authUser = await getCurrentUser();

        if (!authUser) {
          if (isMounted) {
            setMessage("Log in to see your job applications.");
            setLoading(false);
          }
          return;
        }

        const userApplications = await getUserJobApplications(authUser);
        if (isMounted) {
          setApplications(userApplications);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading job applications:", error);
        if (isMounted) {
          setMessage("Could not load your applications right now.");
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 pb-5 pt-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/jobs" className="mb-4 inline-flex text-kasi-dark">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-kasi-dark">My Applications</h1>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Track where each job application sits in the beta review flow.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6">
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-yellow-700" size={20} />
            <p className="text-xs leading-relaxed text-yellow-900">
              Statuses are beta review markers only. Accepted does not start a contract, payment, escrow, or Stripe flow.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
            <p className="mt-3 text-sm font-bold text-gray-500">Loading applications...</p>
          </div>
        ) : message ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Briefcase className="mx-auto text-gray-300" size={36} />
            <p className="mt-3 text-sm font-bold text-gray-500">{message}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Briefcase className="mx-auto text-gray-300" size={36} />
            <h2 className="mt-4 text-lg font-black text-kasi-dark">No applications yet</h2>
            <p className="mt-2 text-sm text-gray-500">Apply to a beta job to see the review status here.</p>
            <Link
              href="/jobs"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-kasi-gold px-4 py-3 text-sm font-black text-kasi-dark"
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => {
              const status = applicationStatuses[application.status] || applicationStatuses.interested;

              return (
                <article
                  key={application.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                        Application ref {application.id}
                      </p>
                      <h2 className="mt-1 text-lg font-black text-kasi-dark">{application.jobTitle}</h2>
                      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-gray-500">
                        <Clock size={13} />
                        Applied {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${statusStyles[application.status] || statusStyles.interested}`}>
                      <CheckCircle size={13} />
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{status.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/jobs/${application.jobId}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-xs font-black text-kasi-dark"
                    >
                      View job
                    </Link>
                    {application.messageThreadId && application.messagingState === "open" ? (
                      <Link
                        href={`/messages/${application.messageThreadId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-kasi-gold px-4 py-2 text-xs font-black text-kasi-dark"
                      >
                        <MessageCircle size={14} />
                        Open conversation
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
