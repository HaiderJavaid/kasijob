"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, DollarSign, CheckCircle, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import { getAllJobs } from "@/lib/jobs";

// MOCK DATABASE (Same as the list, but with descriptions)
const JOBS_DB = [
  {
    id: 1,
    title: "Design Logo for Cafe",
    price: 50,
    location: "Remote",
    client: "Kopi Satu",
    desc: "We need a modern, hipster logo for our new cafe in Bangsar. Must include a coffee bean icon. Black and Gold theme preferred.",
    tags: ["Design", "Urgent"],
    requirements: ["Must use Illustrator", "2 Revisions included", "Deliver in PNG/SVG"]
  },
  {
    id: 2,
    title: "Help Move Furniture",
    price: 120,
    location: "Subang Jaya",
    client: "Mrs. Chong",
    desc: "Need 2 strong guys to help move a sofa and fridge to the 2nd floor. No lift, stairs only. Lunch provided.",
    tags: ["Labor", "Physical"],
    requirements: ["Strong", "Available Saturday morning"]
  },
  {
    id: 3,
    title: "Translate Malay to English",
    price: 30,
    location: "Remote",
    client: "Student Ali",
    desc: "I have a 5-page assignment needed to be translated. Academic language required.",
    tags: ["Writing", "Easy"],
    requirements: ["Good English", "Fast typer"]
  },
  // If ID doesn't match, we show a default
];

export default function JobDetailsPage() {
  const params = useParams();
  const [job, setJob] = useState(null);
  const [isApplied, setIsApplied] = useState(false); 

  useEffect(() => {
    // 1. Get ALL jobs (User posted + Mock)
    const allJobs = getAllJobs(JOBS_DB); 
    
    // 2. Find the match
    const foundJob = allJobs.find(j => j.id == params.id);
    
    if (foundJob) {
      setJob(foundJob);
    } else {
      setJob(JOBS_DB[0]); // Fallback
    }
  }, [params.id]);

  if (!job) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white pb-32 relative">
      
      {/* 1. HEADER IMAGE AREA */}
      <div className="bg-kasi-dark h-48 relative rounded-b-[2rem] mb-6">
        <Link href="/jobs" className="absolute top-12 left-6 bg-white/20 p-2 rounded-full text-white backdrop-blur-md">
          <ArrowLeft size={20} />
        </Link>
        <div className="absolute -bottom-6 left-6 w-16 h-16 bg-kasi-gold rounded-2xl flex items-center justify-center text-2xl shadow-float border-4 border-white">
          💼
        </div>
      </div>

      {/* 2. TITLE & PRICE */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-black text-kasi-dark w-2/3 leading-tight">
            {job.title}
          </h1>
          <div className="text-right">
            <span className="block text-2xl font-black text-kasi-gold">RM {job.price}</span>
            <span className="text-xs text-gray-400">Fixed Price</span>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <span className="font-bold text-kasi-dark">{job.client}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={14} /> posted today</span>
        </div>
      </div>

      {/* 3. DIVIDER */}
      <hr className="my-6 border-gray-100" />

      {/* 4. DESCRIPTION */}
      <div className="px-6">
        <h3 className="font-bold text-lg mb-3">Job Description</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          {job.desc}
        </p>

        <h3 className="font-bold text-lg mb-3">Requirements</h3>
        <ul className="space-y-2">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle size={16} className="text-kasi-gold" />
              {req}
            </li>
          ))}
        </ul>
      </div>

      {/* 5. TRUST BADGE */}
      <div className="px-6 mt-8">
        <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100">
          <Shield className="text-green-500" size={24} />
          <div>
            <p className="text-xs font-bold text-kasi-dark">Payment Verified</p>
            <p className="text-[10px] text-gray-400">Money is held safely until job is done.</p>
          </div>
        </div>
      </div>

      {/* 6. FIXED BOTTOM BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-md mx-auto">
        {!isApplied ? (
          <button 
            onClick={() => setIsApplied(true)}
            className="w-full bg-kasi-dark text-white font-black py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Apply Now
          </button>
        ) : (
          <button 
            disabled
            className="w-full bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} /> Application Sent!
          </button>
        )}
      </div>

    </div>
  );
}