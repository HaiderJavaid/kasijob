"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Zap, User, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust path if needed (e.g. @/lib/firebase)

export default function BottomNav() {
  const pathname = usePathname();
  const [hasNotification, setHasNotification] = useState(false);

  // --- GLOBAL NOTIFICATION CHECKER ---
  useEffect(() => {
    const checkForUpdates = async () => {
      // 1. If we already know there's a notif locally, show it (Fast)
      if (typeof window !== 'undefined' && localStorage.getItem("kasi_task_alert") === "true") {
        setHasNotification(true);
      }

      // 2. Perform a real check against the database (Background)
      try {
        // Get the last time user visited the tasks tab
        const lastVisit = parseInt(localStorage.getItem("kasi_last_visit_available") || "0");
        
        // Query: Get the MOST RECENT active task
        // We order by createdAt desc and limit to 1 for speed
        const q = query(
          collection(db, "tasks"), 
          where("isActive", "==", true), 
          orderBy("createdAt", "desc"), 
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const latestTask = snapshot.docs[0].data();
          const taskTime = latestTask.createdAt?.toDate ? latestTask.createdAt.toDate().getTime() : 0;
          
          // If the latest task is NEWER than our last visit, show the dot!
          if (taskTime > lastVisit) {
            setHasNotification(true);
            localStorage.setItem("kasi_task_alert", "true"); // Cache it
          } else {
            // Otherwise, ensure it's off (unless there are status updates, which we can add later)
            // For now, let's trust the TasksPage to clear it on click
          }
        }
      } catch (error) {
        // Silent fail (don't break navbar if DB issues)
        console.log("Nav check skipped:", error);
      }
    };

    // Run on mount
    checkForUpdates();

    // Also listen for local updates (when user clicks tab and clears it)
    const syncLocal = () => {
        setHasNotification(localStorage.getItem("kasi_task_alert") === "true");
    };
    window.addEventListener("kasi_notif_update", syncLocal);
    window.addEventListener("storage", syncLocal);

    return () => {
        window.removeEventListener("kasi_notif_update", syncLocal);
        window.removeEventListener("storage", syncLocal);
    };
  }, [pathname]);

  const hiddenRoutes = ["/", "/login", "/register", "/admin/tasks", "/admin/reviews"];
  if (hiddenRoutes.includes(pathname)) return null;

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] flex justify-center pb-4 pt-2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      <nav className="bg-kasi-dark/95 backdrop-blur-md text-white border border-white/10 rounded-full px-6 py-3 shadow-float pointer-events-auto flex items-center gap-8 mb-4 max-w-[90%] mx-auto relative">
        
        {/* JOBS TAB */}
        <Link href="/jobs" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/jobs') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Briefcase size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/jobs') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Jobs
          </span>
        </Link>

        {/* TASKS TAB (With Red Dot) */}
        <Link href="/tasks" className="flex flex-col items-center gap-1 group relative">
          
          {/* THE RED DOT */}
          {hasNotification && (
            <span className="absolute top-0 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-kasi-dark z-50 animate-bounce shadow-lg shadow-red-500/50"></span>
          )}

          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/tasks') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Zap size={20} strokeWidth={2.5} fill={isActive('/tasks') ? "currentColor" : "none"} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/tasks') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Tasks
          </span>
        </Link>

        {/* LEADERBOARD TAB */}
        <Link href="/leaderboard" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/leaderboard') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/leaderboard') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Rank
          </span>
        </Link>

        {/* PROFILE TAB */}
        <Link href="/profile" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/profile') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <User size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/profile') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Profile
          </span>
        </Link>

      </nav>
    </div>
  );
}