"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { addMessageToThread, getMessageThreadById } from "@/lib/messages";
import { getCurrentUser } from "@/lib/auth";

const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  return `RM ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

const formatMessageTime = (createdAt) => {
  if (!createdAt) return "Demo";

  try {
    return new Intl.DateTimeFormat("en-MY", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(createdAt));
  } catch {
    return "Demo";
  }
};

export default function MessageThreadPage() {
  const params = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadThread() {
      const authUser = await getCurrentUser();
      const selectedThread = await getMessageThreadById(params.id, authUser);

      if (isMounted) {
        setThread(selectedThread);
        setLoading(false);
      }
    }

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const sortedMessages = useMemo(() => {
    if (!thread?.messages) return [];

    return [...thread.messages].sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return firstTime - secondTime;
    });
  }, [thread]);

  const handleSendReply = async (event) => {
    event.preventDefault();
    const body = reply.trim();

    if (!body || !thread) return;

    setIsSending(true);
    setNotice("");

    if (thread.source === "sample") {
      const message = {
        id: `local-${Date.now()}`,
        authorName: "Demo worker",
        authorRole: "worker",
        body,
        createdAt: new Date(),
      };
      setThread((currentThread) => ({
        ...currentThread,
        messages: [...currentThread.messages, message],
        updatedAt: message.createdAt,
      }));
      setReply("");
      setNotice("Demo reply added locally for this browser session.");
      setIsSending(false);
      return;
    }

    const result = await addMessageToThread(thread.id, { body });

    if (!result.success) {
      setNotice(result.error || "Could not send this message.");
      setIsSending(false);
      return;
    }

    setThread((currentThread) => ({
      ...currentThread,
      messages: [...currentThread.messages, result.message],
      updatedAt: result.message.createdAt,
    }));
    setReply("");
    setNotice("Message sent.");
    setIsSending(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kasi-gray font-sans">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
          <p className="mt-3 text-sm font-bold text-gray-500">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-kasi-gray px-6 py-10 font-sans">
        <Link href="/messages" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-kasi-dark">
          <ArrowLeft size={18} />
          Back to messages
        </Link>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <MessageCircle className="mx-auto text-gray-300" size={40} />
          <h1 className="mt-4 text-xl font-black text-kasi-dark">Thread not found</h1>
          <p className="mt-2 text-sm text-gray-500">This discussion may have been removed or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kasi-gray pb-36 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 pb-5 pt-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/messages" className="mb-4 inline-flex text-kasi-dark">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
              <MessageCircle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                {formatBudget(thread.jobBudget)} job discussion
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-kasi-dark">{thread.jobTitle}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-5 py-6">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-yellow-700" size={20} />
            <p className="text-xs leading-relaxed text-yellow-900">
              Messages here are for demo coordination only. They do not create a contract, payment obligation, or admin-approved match.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <UserRound className="shrink-0 text-kasi-dark" size={20} />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">Poster</p>
                <p className="text-sm font-bold text-kasi-dark">{thread.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <UserRound className="shrink-0 text-kasi-dark" size={20} />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">Worker</p>
                <p className="text-sm font-bold text-kasi-dark">{thread.workerName}</p>
              </div>
            </div>
          </div>

          {thread.jobId ? (
            <Link
              href={`/jobs/${thread.jobId}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-kasi-dark"
            >
              <Briefcase size={16} />
              View related job
            </Link>
          ) : null}
        </section>

        <section className="space-y-3">
          {sortedMessages.map((message) => {
            const isWorker = message.authorRole === "worker";

            return (
              <div
                key={message.id}
                className={`flex ${isWorker ? "justify-end" : "justify-start"}`}
              >
                <article
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    isWorker
                      ? "bg-kasi-dark text-white"
                      : "border border-gray-100 bg-white text-kasi-dark"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide opacity-70">
                    <span>{message.authorName}</span>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.body}</p>
                </article>
              </div>
            );
          })}
        </section>

        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm font-bold text-green-700">
            <CheckCircle size={16} />
            {notice}
          </div>
        ) : null}
      </main>

      <form onSubmit={handleSendReply} className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows="2"
            placeholder={thread.state === "closed" ? "This conversation is closed" : "Write a reply..."}
            disabled={thread.state === "closed"}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
          />
          <button
            type="submit"
            disabled={isSending || !reply.trim() || thread.state === "closed"}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-kasi-gold text-kasi-dark shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
}
