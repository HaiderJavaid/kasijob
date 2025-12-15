export const dynamic = "force-dynamic"; // <--- ADD THIS LINE AT THE TOP
"use client"; 

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, Briefcase, Send } from "lucide-react";
import { getAllJobs } from "@/lib/jobs";

// MOCK DATA (Backup list)
const JOBS = [
  {
    id: 1,
    title: "Design Logo for Cafe",
    price: 50,
    location: "Remote",
    time: "2 hrs ago",
    tags: ["Design", "Urgent"],
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: 2,
    title: "Help Move Furniture",
    price: 120,
    location: "Subang Jaya",
    time: "5 hrs ago",
    tags: ["Labor", "Physical"],
    color: "bg-orange-100 text-orange-600"
  },
  {
    id: 3,
    title: "Translate Malay to English",
    price: 30,
    location: "Remote",
    time: "1 day ago",
    tags: ["Writing", "Easy"],
    color: "bg-blue-100 text-blue-600"
  },
];

const CATEGORIES = ["All", "Design", "Labor", "Writing", "Tech", "Driver"];

export default function JobsPage() {
  const [jobs, setJobs] = useState(JOBS);

 // Inside JobsPage...
  useEffect(() => {
    // Create an async function inside the effect
    const fetchJobs = async () => {
      const combinedJobs = await getAllJobs(JOBS);
      setJobs(combinedJobs);
    };
    
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-kasi-gray pb-28 relative">
      
      {/* --- HEADER SECTION (Sticky) --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-12 pb-4 px-6">
        
        {/* Header and Floating Button Container */}
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black text-kasi-dark">Cari Peluang</h1>
            
            {/* Post Job Button (Links to the form) */}
            <Link href="/jobs/post" className="bg-kasi-gold p-2 rounded-full text-kasi-dark shadow-md hover:scale-105 active:scale-95 transition-transform">
                <Send size={20} />
            </Link>
        </div>

        {/* Search Bar */}
        <div className="relative shadow-sm">
          <input 
            type="text" 
            placeholder="Search for jobs..." 
            className="w-full bg-gray-100 text-kasi-dark py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-kasi-gold placeholder-gray-400 font-medium"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="flex gap-3 overflow-x-auto mt-4 pb-2 no-scrollbar">
          {CATEGORIES.map((cat, index) => (
            <button 
              key={index}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all ${
                index === 0 
                  ? "bg-kasi-dark text-kasi-gold shadow-md" 
                  : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- JOB LIST SECTION --- */}
      <div className="px-6 mt-6 space-y-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <div className="bg-white p-5 rounded-2xl shadow-card hover:shadow-lg transition-shadow border border-transparent hover:border-kasi-gold/30 group mb-4 cursor-pointer">
              
              <div className="flex justify-between items-start mb-3">
                {/* Job Icon Placeholder */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.color || "bg-gray-100 text-gray-500"} mb-2`}>
                  <Briefcase size={20} strokeWidth={2.5} />
                </div>
                
                {/* Price Tag */}
                <div className="bg-kasi-dark px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-kasi-gold font-black text-sm">RM {job.price}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-kasi-dark leading-tight mb-2">
                {job.title}
              </h3>

              {/* Metadata (Location & Time) */}
              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {job.time}
                </div>
              </div>

              {/* Footer: Tags & Button */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  {(job.tags || ["General"]).map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Visual Button only - the Link wraps the whole card */}
                <span className="bg-kasi-gold text-kasi-dark text-xs font-bold px-4 py-2 rounded-lg group-hover:bg-yellow-400">
                  View
                </span>
              </div>

            </div>
          </Link>
        ))}

        {/* End of List Spacer */}
        <div className="text-center text-gray-400 text-xs py-8">
          You have reached the end. <br/> Rajin sikit scroll atas!
        </div>
      </div>

    </div>
  );
}