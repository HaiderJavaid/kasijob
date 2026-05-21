"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { syncEmailVerification } from "@/lib/verification";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/verify-email"]);

export default function EmailVerificationGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!auth || PUBLIC_PATHS.has(pathname)) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      if (!user.emailVerified) {
        const nextPath = `${pathname}${window.location.search || ""}`;
        router.replace(`/verify-email?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      await syncEmailVerification(user);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return null;
}
