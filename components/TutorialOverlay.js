"use client";
import { useState, useEffect } from "react";
import { X, ArrowRight, Zap, Trophy, User } from "lucide-react";

export default function TutorialOverlay({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show tutorial only if user exists and hasn't seen it yet
    const hasSeen = localStorage.getItem(`kasi_tutorial_seen_${user?.uid}`);
    if (user && !hasSeen) {
      setIsVisible(true);
    }
  }, [user]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleFinish = () => {
    localStorage.setItem(`kasi_tutorial_seen_${user?.uid}`, "true");
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl overflow-hidden">
        
        {/* Step 1: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-kasi-gold rounded-full flex items-center justify-center mx-auto text-kasi-dark shadow-lg shadow-yellow-200">
              <span className="text-2xl font-black">👋</span>
            </div>
            <h2 className="text-2xl font-black text-kasi-dark">Welcome, {user.name}!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Welcome to <b>KasiJobs</b>. We help you turn your spare time into real cash. Let's show you around quickly.
            </p>
            <button onClick={handleNext} className="w-full bg-kasi-dark text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:scale-[1.02] transition">
              Let's Start <ArrowRight size={18}/>
            </button>
          </div>
        )}

        {/* Step 2: Available Tasks */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
              <Zap size={32} />
            </div>
            <h2 className="text-xl font-black text-kasi-dark">Simple Tasks</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              In the <b>"Available"</b> tab, you'll find quick tasks like liking posts or visiting websites. Click one to start earning immediately.
            </p>
            <button onClick={handleNext} className="w-full bg-kasi-gold text-kasi-dark font-bold py-3 rounded-xl mt-4">
              Got it
            </button>
          </div>
        )}

        {/* Step 3: Partners/Offerwalls */}
        {step === 2 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600">
              <Trophy size={32} />
            </div>
            <h2 className="text-xl font-black text-kasi-dark">Earn BIG Money</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Check out the <b>"Partners"</b> tab! This is where you find high-paying surveys and game offers (up to RM 50+ per task).
            </p>
            <button onClick={handleFinish} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-green-200">
              Start Earning Now!
            </button>
          </div>
        )}

        {/* Skip Button */}
        <button onClick={handleFinish} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
          <X size={20} />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 0 ? "bg-kasi-dark" : "bg-gray-200"}`}></div>
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-kasi-dark" : "bg-gray-200"}`}></div>
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-kasi-dark" : "bg-gray-200"}`}></div>
        </div>

      </div>
    </div>
  );
}