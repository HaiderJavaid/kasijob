"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock,
  FileText,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getAllJobs } from "@/lib/jobs";

const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  return `RM ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

const statusLabel = {
  review: "Posted for review",
  open: "Open",
  interested: "Interested",
  admin_reviewed_beta: "Admin-reviewed beta",
  beta_sample: "Open sample",
  admin_beta: "Admin-reviewed beta",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      const availableJobs = await getAllJobs();
      if (isMounted) {
        setJobs(availableJobs);
        setLoading(false);
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 font-sans">
      <section className="bg-kasi-dark px-6 pb-10 pt-10 text-white rounded-b-[2rem]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-kasi-gold">
            <ShieldCheck size={14} />
            Controlled marketplace beta
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">KasiJobs Marketplace</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-kasi-subtle">
                Find small paid jobs, register interest, and help KasiJobs shape a safer local work marketplace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs/applications"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white transition active:scale-95"
              >
                <FileText size={18} />
                My applications
              </Link>
              <Link
                href="/jobs/manage"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white transition active:scale-95"
              >
                <Users size={18} />
                Manage
              </Link>
              <Link
                href="/messages"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white transition active:scale-95"
              >
                <MessageCircle size={18} />
                Messages
              </Link>
              <Link
                href="/jobs/post"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-kasi-gold px-4 py-3 text-sm font-black text-kasi-dark shadow-lg transition active:scale-95"
              >
                <Plus size={18} />
                Post a job
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5 -mt-5 space-y-5">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kasi-gold text-kasi-dark">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-kasi-dark">Prototype-safe marketplace</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Job posts and applications are admin-reviewed beta records. No payments, escrow, Stripe, real-time chat, or bidding are enabled in this demo.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-kasi-dark" size={28} />
            <p className="mt-3 text-sm font-bold text-gray-500">Loading jobs...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
                      <Briefcase size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                        {job.category}
                      </p>
                      <h3 className="mt-1 text-lg font-black leading-tight text-kasi-dark">
                        {job.title}
                      </h3>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 shrink-0 text-gray-300 transition group-hover:text-kasi-dark"
                  />
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
                  {job.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-kasi-dark">
                    {formatBudget(job.budget)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                    <MapPin size={12} />
                    {job.locationType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                    <Clock size={12} />
                    {statusLabel[job.status] || "Beta"}
                  </span>
                  {job.source === "firestore" || job.source === "admin_beta" ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                      Admin-reviewed beta
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
