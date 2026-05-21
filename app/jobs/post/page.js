"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  DollarSign,
  FileText,
  List,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { saveJob } from "@/lib/jobs";

const initialForm = {
  title: "",
  budget: "",
  description: "",
  locationType: "Remote",
  category: "General",
  requirements: "",
  client: "",
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const authUser = await getCurrentUser();

      if (!authUser) {
        setMessage("Please log in before submitting a beta job for admin review.");
        return;
      }

      if (!authUser.emailVerified) {
        router.replace("/verify-email?next=/jobs/post");
        return;
      }

      const result = await saveJob({
        title: form.title,
        budget: Number(form.budget),
        description: form.description,
        locationType: form.locationType,
        category: form.category,
        requirements: form.requirements,
        client: form.client || authUser.displayName || "Beta client",
        posterId: authUser.uid,
        posterEmail: authUser.email || null,
      });

      if (!result.success) {
        setMessage(result.error || "Could not submit this job right now.");
        return;
      }

      router.push(`/jobs/${result.id}`);
    } catch (error) {
      console.error("Error submitting job:", error);
      setMessage("Could not submit this job. Please check your login and Firebase setup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 pb-5 pt-10">
        <div className="mx-auto max-w-2xl">
          <Link href="/jobs" className="mb-4 inline-flex text-kasi-dark">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kasi-dark text-kasi-gold">
              <Briefcase size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-kasi-dark">Post a Job for Review</h1>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Share the scope, budget, and worker requirements for the KasiJobs marketplace beta.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-yellow-700" size={20} />
            <p className="text-xs leading-relaxed text-yellow-900">
              This form creates a posted-for-review job record. It does not collect payment, create escrow, use Stripe, or start a worker contract.
            </p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {["Posted for review", "Admin-reviewed beta", "Open for interest"].map((step) => (
            <div key={step} className="rounded-xl border border-gray-100 bg-white p-3 text-xs font-black text-kasi-dark shadow-sm">
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
              <Tag size={16} /> Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Design a simple landing page"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
                <Briefcase size={16} /> Category
              </label>
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
              >
                <option value="General">General</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Tech">Tech/Web</option>
                <option value="Event">Event Help</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
                <MapPin size={16} /> Location
              </label>
              <select
                value={form.locationType}
                onChange={(event) => updateField("locationType", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
              >
                <option value="Remote">Remote</option>
                <option value="On-Site (KL)">On-Site (KL)</option>
                <option value="On-Site (Selangor)">On-Site (Selangor)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
                <DollarSign size={16} /> Listed Budget (RM)
              </label>
              <input
                type="number"
                placeholder="100"
                value={form.budget}
                onChange={(event) => updateField("budget", event.target.value)}
                required
                min="10"
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
                <CheckCircle size={16} /> Client / Company Label
              </label>
              <input
                type="text"
                placeholder="e.g. KasiJobs Beta"
                value={form.client}
                onChange={(event) => updateField("client", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
              <List size={16} /> Requirements
            </label>
            <textarea
              rows="4"
              placeholder={"Put each requirement on a new line\nCan start this week\nShare previous work sample"}
              value={form.requirements}
              onChange={(event) => updateField("requirements", event.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-kasi-dark">
              <FileText size={16} /> Full Description
            </label>
            <textarea
              rows="6"
              placeholder="Describe the scope, expected output, timeline, and any admin review notes."
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-gray-900 outline-none transition focus:border-kasi-gold focus:ring-1 focus:ring-kasi-gold"
            />
          </div>

          {message ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-kasi-gold py-4 font-black text-kasi-dark shadow-lg transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {isLoading ? "Submitting..." : "Submit as Posted for Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
