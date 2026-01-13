"use client";
import { Briefcase, Clock } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-kasi-gray flex flex-col items-center justify-center p-6 text-center font-sans pb-24">
      
      {/* Icon Container */}
      <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-8 relative">
        <Briefcase size={40} className="text-kasi-dark" />
        <div className="absolute -top-2 -right-2 bg-kasi-gold text-kasi-dark p-2 rounded-full shadow-md animate-bounce">
            <Clock size={20} />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-black text-kasi-dark mb-2">
        Side-Jobs
      </h1>
      <h2 className="text-xl font-bold text-gray-400 mb-6">
        Coming <span className="text-kasi-gold">Soon</span>
      </h2>
      
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
        We are currently partnering with top Malaysian companies to bring you high-paying freelance and full-time gig opportunities.
      </p>

      {/* Decoration */}
      <div className="mt-12 flex gap-2 justify-center opacity-20">
        <div className="w-2 h-2 rounded-full bg-kasi-dark"></div>
        <div className="w-2 h-2 rounded-full bg-kasi-dark"></div>
        <div className="w-2 h-2 rounded-full bg-kasi-dark"></div>
      </div>

    </div>
  );
}