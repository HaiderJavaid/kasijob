"use client";

export const dynamic = "force-dynamic"; // <--- ADD THIS LINE AT THE TOP

import { useState, useEffect } from "react"; // <--- Hook for state
import { Play, FileText, Share2, Gift, Zap, ChevronRight } from "lucide-react";
import { getCurrentUser, updateUserBalance } from "@/lib/auth"; // <--- Import our helpers

// Mock Data: The Missions
const TASKS = [
  {
    id: 1,
    title: "Watch Video Ad",
    points: 50,
    desc: "15 seconds",
    icon: <Play size={24} fill="currentColor" />,
    color: "text-red-500 bg-red-100",
    action: "Watch"
  },
  {
    id: 2,
    title: "Answer Survey",
    points: 120,
    desc: "About food",
    icon: <FileText size={24} />,
    color: "text-blue-500 bg-blue-100",
    action: "Start"
  },
  {
    id: 3,
    title: "Share on FB",
    points: 30,
    desc: "Public post",
    icon: <Share2 size={24} />,
    color: "text-indigo-500 bg-indigo-100",
    action: "Share"
  },
  {
    id: 4,
    title: "Install App",
    points: 500,
    desc: "Game app",
    icon: <Zap size={24} fill="currentColor" />,
    color: "text-kasi-gold bg-black",
    action: "Install"
  }
];

export default function TasksPage() {
  const [user, setUser] = useState({ points: 0, balance: "RM 0.00" });
  const [loadingTask, setLoadingTask] = useState(null); // To show "Processing..."

  // Load User Data on Start
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  // THE MAGIC FUNCTION
  // Inside app/tasks/page.js

const handleTaskClick = (taskId, taskTitle, points, rewardRM) => {
  setLoadingTask(taskId);

  setTimeout(() => {
    // PASS 'taskTitle' as the 3rd argument!
    const updatedUser = updateUserBalance(rewardRM, points, taskTitle); 
    
    setUser(updatedUser);
    setLoadingTask(null);
    alert(`Tahniah! You earned ${points} pts from ${taskTitle}`);
  }, 1500);
};
  return (
    <div className="min-h-screen bg-kasi-gray pb-28 relative">
      
      {/* 1. GAMIFIED HEADER */}
      <div className="bg-kasi-dark pt-12 pb-16 px-6 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-2xl font-black mb-1">Misi Harian</h1>
            <p className="text-gray-400 text-xs">Complete tasks, get paid.</p>
          </div>
          <div className="text-right">
            {/* DYNAMIC POINTS */}
            <div className="text-kasi-gold font-black text-3xl animate-pulse">
              {user.points || 0}
            </div>
            <div className="text-white text-[10px] uppercase tracking-widest opacity-60">My Points</div>
          </div>
        </div>
      </div>

      {/* 2. DAILY CHECK-IN */}
      <div className="px-6 -mt-8 relative z-20 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-float flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-kasi-dark">
              <Gift size={20} />
            </div>
            <div>
              <h3 className="font-bold text-kasi-dark text-sm">Daily Check-in</h3>
              <p className="text-xs text-gray-500">Free money everyday!</p>
            </div>
          </div>
          <button 
            onClick={() => handleTaskClick(99, "Daily Check-in", 10, 0.10)}
            className="bg-kasi-gold text-kasi-dark text-xs font-bold px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            Claim +10
          </button>
        </div>
      </div>

      {/* 3. TASK GRID */}
      <div className="px-6">
        <h2 className="text-kasi-dark font-bold text-lg mb-4 flex items-center gap-2">
          Available Now <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">Live</span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {TASKS.map((task) => (
            <div 
              key={task.id} 
              onClick={() => handleTaskClick(task.id, task.title, task.points, (task.points / 100))} // Logic: 100pts = RM1
              className={`bg-white p-4 rounded-2xl shadow-card hover:shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center text-center relative overflow-hidden group ${loadingTask === task.id ? "opacity-50" : ""}`}
            >
              
              {/* Points Badge */}
              <div className="absolute top-0 right-0 bg-kasi-gold text-kasi-dark text-[10px] font-bold px-2 py-1 rounded-bl-xl">
                +{task.points}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-full ${task.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {task.icon}
              </div>

              {/* Text */}
              <h3 className="font-bold text-kasi-dark text-sm mb-1">{task.title}</h3>
              <p className="text-xs text-gray-400 mb-4">{task.desc}</p>

              {/* Button State */}
              <div className="w-full mt-auto bg-gray-50 text-kasi-dark text-xs font-bold py-2 rounded-lg group-hover:bg-kasi-dark group-hover:text-white transition-colors">
                {loadingTask === task.id ? "Wait..." : task.action}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 4. LEADERBOARD (Keep as is) */}
      <div className="px-6 mt-8">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
          <div>
            <h3 className="font-bold text-sm">Top Earner Today</h3>
            <p className="text-xs text-purple-200">Bossku earned 5,000 pts</p>
          </div>
          <ChevronRight className="text-white/50" />
        </div>
      </div>

    </div>
  );
}