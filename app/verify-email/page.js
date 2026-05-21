"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, LogOut, MailCheck, RefreshCw, Send } from "lucide-react";
import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import { syncEmailVerification } from "@/lib/verification";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/tasks";
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Checking your account...");
  const [isChecking, setIsChecking] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!auth) {
      setStatus("Firebase is not configured in this environment.");
      setIsChecking(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      if (currentUser.emailVerified) {
        await syncEmailVerification(currentUser);
        router.replace(nextPath);
        return;
      }

      await syncEmailVerification(currentUser);
      setStatus("Verification is still pending. Check your inbox and tap the link from Firebase.");
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, [nextPath, router]);

  const handleResend = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      setStatus("Verification email sent. Check your inbox or spam folder.");
    } catch (error) {
      console.error("Verification resend failed:", error);
      setStatus(error.message || "Could not send another verification email right now.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    setIsChecking(true);
    setStatus("Checking Firebase verification status...");

    try {
      await reload(user);
      const refreshedUser = auth.currentUser;
      await syncEmailVerification(refreshedUser);

      if (refreshedUser?.emailVerified) {
        setStatus("Email verified. Redirecting...");
        router.replace(nextPath);
        return;
      }

      setStatus("Not verified yet. Open the link from your email, then check again.");
    } catch (error) {
      console.error("Verification refresh failed:", error);
      setStatus(error.message || "Could not refresh your verification status.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logoutUser();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 text-white font-sans selection:bg-[#FFD700] selection:text-black">
      <Link href="/" className="absolute left-6 top-8 flex items-center gap-2 text-sm font-bold text-gray-400 transition hover:text-white">
        <ArrowLeft size={18} /> Home
      </Link>

      <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-[#FFD700] opacity-10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-blue-600 opacity-10 blur-[150px] pointer-events-none"></div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20">
            <MailCheck size={38} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Verify your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            KasiJobs needs a verified email before tasks, rewards, leaderboard access, and beta job posting unlock.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 shrink-0 text-[#FFD700]" size={20} />
            <div>
              <p className="text-sm font-black text-white">{user?.email || "Your account email"}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">{status}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || isChecking || !user}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD700] py-4 font-black text-black shadow-lg shadow-[#FFD700]/20 transition hover:bg-[#E5C100] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {isSending ? "Sending..." : "Resend Verification Email"}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking || !user}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 font-black text-white transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            {isChecking ? "Checking..." : "I Verified, Check Status"}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-gray-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
