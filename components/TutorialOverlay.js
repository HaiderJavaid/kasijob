"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { X, ArrowRight, Zap, Trophy, User, Gift } from "lucide-react";

export default function TutorialOverlay({ user, forceShow, onClose, currentRoute }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we are continuing from a redirect
    const isContinuing = searchParams.get("tutorial") === "true";
    
    // Check if seen normally
    const hasSeen = localStorage.getItem(`kasi_tutorial_seen_${user?.uid}`);

    if (forceShow || (user && !hasSeen) || isContinuing) {
      setIsVisible(true);
      // If on profile page and continuing, start at specific step
      if (currentRoute === "/profile" && isContinuing) {
          setStep(3); // Start at Profile Step
      } else {
          setStep(0);
      }
    }
  }, [user, forceShow, searchParams, currentRoute]);

  const handleNext = () => {
    setStep(step + 1);
  };

  // --- SPECIAL HANDLER: Move to Profile Page ---
  const handleGoToProfile = () => {
      setIsVisible(false);
      router.push("/profile?tutorial=true");
  };

  const handleFinish = () => {
    if (user) {
        localStorage.setItem(`kasi_tutorial_seen_${user.uid}`, "true");
    }
    setIsVisible(false);
    if (onClose) onClose();
    if (searchParams.get("tutorial")) {
        router.replace("/profile"); 
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col pointer-events-auto">
      
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500"></div>

      {/* CONTENT */}
      <div className="relative z-[10000] flex-1 flex flex-col items-center justify-center p-6">
        
        {/* STEP 0: WELCOME */}
        {step === 0 && currentRoute === "/tasks" && (
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-scale-up relative">
            <button onClick={handleFinish} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X size={20} /></button>
            <div className="w-20 h-20 bg-kasi-gold rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-yellow-200 mb-6 animate-bounce">👋</div>
            <h2 className="text-2xl font-black text-kasi-dark mb-2">Welcome to KasiJobs!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">Let's verify your account and show you how to earn your first <b>RM 5.00</b>.</p>
            <button onClick={handleNext} className="w-full bg-kasi-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg">Start Tutorial <ArrowRight size={18}/></button>
          </div>
        )}

        {/* STEP 1: HIGHLIGHT TASKS (Visual Only since we are already on tasks page) */}
        {step === 1 && currentRoute === "/tasks" && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[350px] h-20 pointer-events-none">
               <div className="absolute bottom-2 left-[25%] w-16 h-16 rounded-full border-4 border-kasi-gold shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-ping"></div>
            </div>
            <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl absolute bottom-32 animate-fade-in-up">
              <h3 className="text-lg font-black text-kasi-dark mb-1 flex items-center gap-2"><Zap size={20} className="text-kasi-gold fill-kasi-gold"/> New Tasks</h3>
              <p className="text-sm text-gray-500 mb-4">When this icon has a <b>Red Dot</b>, new tasks are available! You are already here.</p>
              <button onClick={handleNext} className="bg-kasi-dark text-white text-xs font-bold px-4 py-2 rounded-lg w-full">Next</button>
            </div>
          </>
        )}

        {/* STEP 2: DUMMY TASK */}
        {step === 2 && currentRoute === "/tasks" && (
          <>
            <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[90%] max-w-sm pointer-events-none">
               <div className="absolute top-20 right-4 text-white text-4xl animate-bounce">👇</div>
            </div>
            <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl absolute top-64 animate-fade-in-down">
               <h3 className="text-lg font-black text-kasi-dark mb-1 flex items-center gap-2"><Gift size={20} className="text-purple-500"/> Complete & Earn</h3>
               <p className="text-sm text-gray-500 mb-4">Click a task, follow instructions, and submit proof to earn cash.</p>
               <button onClick={handleGoToProfile} className="bg-green-600 text-white text-xs font-bold px-4 py-3 rounded-lg w-full shadow-lg">Go to Profile →</button>
            </div>
          </>
        )}

        {/* STEP 3: PROFILE (After Redirect) */}
        {step === 3 && currentRoute === "/profile" && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[350px] h-20 pointer-events-none">
               <div className="absolute bottom-2 right-[5%] w-16 h-16 rounded-full border-4 border-kasi-gold shadow-[0_0_30px_rgba(255,215,0,0.8)]"></div>
            </div>
            <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl absolute bottom-32 animate-fade-in-up">
              <h3 className="text-lg font-black text-kasi-dark mb-1 flex items-center gap-2"><User size={20} className="text-blue-500"/> Check Balance</h3>
              <p className="text-sm text-gray-500 mb-4">Click the <b>Profile Tab</b> to see your earnings and withdraw cash to your bank!</p>
              <button onClick={handleFinish} className="bg-green-500 text-white text-xs font-bold px-4 py-3 rounded-xl w-full shadow-lg shadow-green-200">Start Earning Now! 🚀</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}