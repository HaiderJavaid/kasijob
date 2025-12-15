"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Tag, DollarSign, FileText, MapPin, List, Briefcase } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { saveJob } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/auth";

export default function PostJobPage() {
  const router = useRouter();
  
  // 1. ADVANCED STATE VARIABLES
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState("Remote"); 
  const [category, setCategory] = useState("General");
  const [reqText, setReqText] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  // Inside handleSubmit...
const handleSubmit = async (e) => { // <--- Make function async
    e.preventDefault();
    setIsLoading(true);

    // ... create newJob object ...

    await saveJob(newJob); // <--- Add await

    router.push("/jobs");
    setIsLoading(false);
};

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 relative">
      
      {/* HEADER */}
      <div className="bg-white pt-12 pb-6 px-6 border-b border-gray-100 sticky top-0 z-10">
        <Link href="/jobs" className="text-kasi-dark mb-4 inline-block">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-black text-kasi-dark">Post a New Job</h1>
        <p className="text-sm text-gray-500">Fill in the complete details below.</p>
      </div>

      {/* FORM SECTION */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Job Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
            <Tag size={16} /> Job Title
          </label>
          <input
            type="text"
            placeholder="e.g., Design a simple landing page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1"
          />
        </div>

        {/* Category & Location Row */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
              <Briefcase size={16} /> Category
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1"
            >
              <option value="General">General</option>
              <option value="Design">Design</option>
              <option value="Labor">Labor (Tenaga)</option>
              <option value="Writing">Writing</option>
              <option value="Tech">Tech/Web</option>
              <option value="Driver">Driver</option>
            </select>
          </div>

          {/* Location Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
              <MapPin size={16} /> Location
            </label>
            <select 
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1"
            >
              <option value="Remote">Remote</option>
              <option value="On-Site">On-Site (KL)</option>
              <option value="On-Site">On-Site (Selangor)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
            <DollarSign size={16} /> Budget (RM)
          </label>
          <input
            type="number"
            placeholder="e.g., 100"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="10"
            className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1"
          />
        </div>

        {/* Requirements (List) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
            <List size={16} /> Requirements
          </label>
          <textarea
            rows="3"
            // FIXED PLACEHOLDER FOR HYDRATION ERROR
            placeholder={"List requirements here (Press Enter for new line)...\n- Must have experience\n- Can start tomorrow"}
            value={reqText}
            onChange={(e) => setReqText(e.target.value)}
            className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1 resize-none"
          />
          <p className="text-[10px] text-gray-400">Tip: Put each requirement on a new line.</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-kasi-dark flex items-center gap-2">
            <FileText size={16} /> Full Description
          </label>
          <textarea
            rows="5"
            placeholder="Describe the scope of work..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-kasi-gold focus:border-kasi-gold focus:ring-1 resize-none"
          />
        </div>
        
        {/* Post Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-kasi-gold text-kasi-dark font-black py-4 rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
        >
          <Send size={20} />
          {isLoading ? "Posting..." : "Post Job Now"}
        </button>

      </form>
    </div>
  );
}