"use client"; // This is required because this component handles user clicks

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Zap, User, Trophy } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Function to hide nav on certain routes
  const hiddenRoutes = ["/", "/login", "/register", "/admin/tasks", "/admin/reviews"];
  if (hiddenRoutes.includes(pathname)) return null;

  // Simple function to check if a tab is active
  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
      {/* The Floating Dock */}
      <nav className="bg-kasi-dark/95 backdrop-blur-md text-white border border-white/10 rounded-full px-6 py-3 shadow-float pointer-events-auto flex items-center gap-8 mb-4 max-w-[90%] mx-auto">
        
        {/* JOBS TAB */}
        <Link href="/jobs" className="flex flex-col items-center gap-1 group">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/jobs') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Briefcase size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/jobs') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Jobs
          </span>
        </Link>

        {/* TASKS TAB (Center Highlight) */}
        <Link href="/tasks" className="flex flex-col items-center gap-1 group">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/tasks') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Zap size={20} strokeWidth={2.5} fill={isActive('/tasks') ? "currentColor" : "none"} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/tasks') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Tasks
          </span>
        </Link>

        {/* PROFILE TAB */}
        <Link href="/leaderboard" className="flex flex-col items-center gap-1 group">
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/leaderboard') ? 'bg-kasi-gold text-kasi-dark' : 'text-gray-400 group-hover:text-white'}`}>
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <span className={`text-[10px] font-medium ${isActive('/leaderboard') ? 'text-kasi-gold' : 'text-gray-500'}`}>
            Leaderboard
          </span>
        </Link>

        {/* PROFILE TAB */}
        <Link href="/profile" className="flex flex-col items-center gap-1 group">
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