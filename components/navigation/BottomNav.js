"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Zap, User, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [hasNotification, setHasNotification] = useState(false);

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    const checkNotif = () => {
      // We check the flag set by the Tasks page
      const showDot = localStorage.getItem("kasi_task_alert") === "true";
      setHasNotification(showDot);
    };

    // Check immediately
    checkNotif();

    // Listen for updates from other tabs/pages
    window.addEventListener("storage", checkNotif);
    window.addEventListener("kasi_notif_update", checkNotif);

    return () => {
      window.removeEventListener("storage", checkNotif);
      window.removeEventListener("kasi_notif_update", checkNotif);
    };
  }, [pathname]);

  const hiddenRoutes = ["/", "/login", "/register", "/admin/tasks", "/admin/reviews"];
  if (hiddenRoutes.includes(pathname)) return null;

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      <nav className="bg-kasi-dark/95 backdrop-blur-md text-white border border-white/10 rounded-full px-6 py-3 shadow-float pointer-events-auto flex items-center gap-8 mb-4 max-w-[90%] mx-auto">
        
        {/* JOBS TAB */}
        <Link href="/jobs" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/jobs') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Briefcase size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/jobs') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Jobs
          </span>
        </Link>

        {/* TASKS TAB (With Notification Dot) */}
        <Link href="/tasks" className="flex flex-col items-center gap-1 group relative">
          
          {/* THE RED DOT */}
          {hasNotification && (
            <span className="absolute top-0 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-kasi-dark z-10 animate-bounce shadow-lg shadow-red-500/50"></span>
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
            Leaderboard
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