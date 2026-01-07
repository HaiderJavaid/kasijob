"use client";
import Image from "next/image";

export default function Mascot() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* 1. BACKGROUND GLOW (Behind the character) */}
      <div 
      suppressHydrationWarning={true}
      className="absolute inset-0 bg-yellow-400 rounded-full blur-[60px] opacity-20 animate-pulse"></div>

      {/* 2. THE CHARACTER IMAGE */}
      {/* 'animate-float' makes it bob up and down */}
      <div className="relative z-10 w-full h-full animate-float">
        <Image 
            src="/mascot2.png" 
            alt="KasiJobs Mascot"
            width={1000} 
            height={1000}
            className="object-contain drop-shadow-2xl"
            priority
        />
      </div>
      
      {/* 3. CUSTOM ANIMATION STYLE */}
      <style jsx>{`
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); } /* Moves up 20px */
        }
      `}</style>
    </div>
  );
}