"use client";
import { useState, useEffect } from "react";
import { Gift, CircleCheck, Flame, Clock, Lock } from "lucide-react"; // Changed Check to CircleCheck
import { performDailyCheckIn } from "../lib/gamification";

export default function StreakBoard({ user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timerString, setTimerString] = useState(null);
  
  // Current Streak from DB
  const streak = user?.checkInStreak || 0;

  const calculateReward = (day) => Math.min(0.10 + ((day - 1) * 0.10), 0.50);

  // --- TIMER LOGIC ---
  useEffect(() => {
    const checkAvailability = () => {
        if (!user?.lastCheckIn) {
            setCanClaim(true);
            setTimerString(null);
            return;
        }

        const lastCheckInTime = user.lastCheckIn.toDate().getTime();
        const now = new Date().getTime();
        // 20 Hours Cooldown
        const COOLDOWN_MS = 20 * 60 * 60 * 1000; 
        const nextClaimTime = lastCheckInTime + COOLDOWN_MS;
        const diff = nextClaimTime - now;

        if (diff <= 0) {
            setCanClaim(true);
            setTimerString(null);
        } else {
            setCanClaim(false);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimerString(`${hours}h ${minutes}m`);
        }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClaim = async () => {
    if (!user || !canClaim) return;
    setLoading(true);
    
    // Optimistic Update: Make it green instantly while saving
    if (onUpdate) {
         // Create a temporary "Fake" update so UI feels instant
         const estimatedStreak = streak + 1;
         onUpdate({ checkInStreak: estimatedStreak });
    }

    const result = await performDailyCheckIn(user.uid);
    
    if (result.success) {
      if (onUpdate) {
          const now = new Date();
          onUpdate({ 
              balance: (user.balance || 0) + result.reward,
              checkInStreak: result.streak, // Use real server value
              lastCheckIn: { toDate: () => now }
          });
      }
      setCanClaim(false);
    } else {
      alert(result.error);
      // Revert if error (optional, but good practice)
      if (onUpdate) onUpdate({ checkInStreak: streak }); 
    }
    setLoading(false);
  };

  // --- RENDER BUBBLES ---
  const renderDays = () => {
    return [1, 2, 3, 4, 5].map((day) => {
        const rewardAmount = calculateReward(day);
        const isMax = day === 5;
        
        // 1. Completed: Day is less than or equal to current streak
        const isCompleted = day <= streak;
        
        // 2. Current Target: The day we are waiting for
        const isCurrent = day === streak + 1;

        return (
            <div key={day} className={`flex-1 flex flex-col items-center gap-1 relative ${isMax ? "min-w-[50px]" : ""}`}>
                
                {/* CONNECTOR LINE */}
                {day !== 1 && (
                    <div className={`absolute top-3.5 -left-1/2 w-full h-1 rounded-full transition-colors duration-500 ${
                        day <= streak + 1 ? "bg-green-500" : "bg-gray-100"
                    }`} />
                )}
                
                {/* BUBBLE */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-500 ${
                    isCompleted 
                        ? "bg-green-500 text-white shadow-md shadow-green-200" // COMPLETED (Full Green)
                        : isCurrent 
                            ? canClaim 
                                ? "bg-kasi-gold text-kasi-dark scale-110 animate-pulse ring-4 ring-yellow-50 shadow-lg" // READY
                                : "bg-white border-2 border-kasi-gold text-kasi-gold" // WAITING
                            : "bg-gray-100 text-gray-300" // FUTURE
                }`}>
                    {isCompleted ? (
                        <CircleCheck size={20} fill="currentColor" className="text-green-800" />
                    ) : isCurrent ? (
                        canClaim ? <Gift size={16}/> : <Clock size={16}/> 
                    ) : (
                        day
                    )}
                </div>
                
                {/* REWARD TEXT */}
                <span className={`text-[9px] font-bold mt-1 ${isCurrent || isCompleted ? "text-kasi-dark" : "text-gray-300"}`}>
                    RM{rewardAmount.toFixed(2)}
                </span>
            </div>
        );
    });
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Flame size={100} /></div>

        <div className="flex justify-between items-center mb-5">
            <div>
                <h3 className="font-black text-lg text-kasi-dark flex items-center gap-2">
                    Daily Streak <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider"><Flame size={10} fill="currentColor"/> {streak} Days</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Login daily to boost your rewards!</p>
            </div>
            
            {/* CLAIM BUTTON */}
            <button 
                onClick={handleClaim} 
                disabled={!canClaim || loading}
                className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                    canClaim 
                    ? "bg-kasi-dark text-white hover:bg-black hover:shadow-xl shadow-gray-200" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200"
                }`}
            >
                {loading ? (
                    "..." 
                ) : canClaim ? (
                    "Claim Reward"
                ) : (
                    <><Clock size={14}/> {timerString || "Wait..."}</>
                )}
            </button>
        </div>

        {/* VISUAL BAR */}
        <div className="flex justify-between relative px-1">
            {renderDays()}
        </div>
    </div>
  );
}