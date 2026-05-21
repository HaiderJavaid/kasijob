"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Loader2,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getAllMessageThreads } from "@/lib/messages";
import { getCurrentUser } from "@/lib/auth";

const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  return `RM ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

const formatUpdatedAt = (updatedAt) => {
  if (!updatedAt) return "Demo thread";

  try {
    return new Intl.DateTimeFormat("en-MY", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(updatedAt));
  } catch {
    return "Demo thread";
  }
};

const getLastMessage = (thread) => thread.lastMessagePreview || thread.messages[thread.messages.length - 1]?.body || "No messages yet.";

export default function MessagesPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadThreads() {
      const authUser = await getCurrentUser();
      const availableThreads = await getAllMessageThreads(authUser);
      if (isMounted) {
        setThreads(availableThreads);
        setLoading(false);
      }
    }

    loadThreads();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 font-sans">
      <section className="rounded-b-[2rem] bg-kasi-dark px-6 pb-10 pt-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-kasi-gold">
            <MessageCircle size={14} />
            Job discussions
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">Messages</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-kasi-subtle">
                Lightweight job threads for poster-worker questions during the marketplace beta.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-kasi-gold px-4 py-3 text-sm font-black text-kasi-dark shadow-lg transition active:scale-95"
            >
              <Briefcase size={18} />
              Browse jobs
            </Link>
          </div>
        </div>
      </section>

      <main className="-mt-5 mx-auto max-w-4xl space-y-5 px-5">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kasi-gold text-kasi-dark">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-kasi-dark">Portfolio-safe messaging</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                This is a simple thread view, not a real-time chat, contract, payment, or dispute system.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
            <p className="mt-3 text-sm font-bold text-gray-500">Loading messages...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <MessageCircle className="mx-auto text-gray-300" size={34} />
            <h2 className="mt-4 text-lg font-black text-kasi-dark">No private conversations yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
              Conversations appear after a poster shortlists or accepts an application.
            </p>
            <Link
              href="/jobs/applications"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-kasi-dark px-4 py-3 text-sm font-black text-white"
            >
              View applications
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
                      <MessageCircle size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                        {formatBudget(thread.jobBudget)} job
                      </p>
                      <h2 className="mt-1 text-lg font-black leading-tight text-kasi-dark">
                        {thread.jobTitle}
                      </h2>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 shrink-0 text-gray-300 transition group-hover:text-kasi-dark"
                  />
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
                  {getLastMessage(thread)}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-kasi-dark">
                    <UserRound size={12} />
                    {thread.workerName} and {thread.clientName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                    <Clock size={12} />
                    {formatUpdatedAt(thread.updatedAt)}
                  </span>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                    {thread.state === "closed" ? "Closed" : thread.source === "sample" ? "Demo" : "Private"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
