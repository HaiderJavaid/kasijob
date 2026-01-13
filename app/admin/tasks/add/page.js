"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "../../../../lib/tasks"; 
import { 
  ArrowLeft, Plus, Clock, Globe, FileText, List,
  Instagram, Facebook, Youtube, Twitter, Music2 
} from "lucide-react";

export default function AddTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("none"); 

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const newTask = {
      title: formData.get("title"),
      description: formData.get("description"), // Short Summary (Step 1)
      instructions: formData.get("instructions"), // Detailed Steps (Step 2)
      reward: parseFloat(formData.get("reward")),
      link: formData.get("link"),
      type: formData.get("type"),
      platform: formData.get("platform"),
      expiryDate: formData.get("expiryDate"),
      limit: parseInt(formData.get("limit") || "0"),
      count: 0
    };

    const result = await addTask(newTask);

    if (result.success) {
      alert("Task Created Successfully!");
      router.push("/admin/tasks"); 
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <button onClick={() => router.push("/admin/tasks")} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-bold text-sm transition">
          <ArrowLeft size={18} className="mr-2" /> Back to List
        </button>

        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <h1 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 bg-kasi-gold rounded-full flex items-center justify-center text-kasi-dark">
              <Plus size={24} />
            </div>
            Create New Task
          </h1>
          
          <form onSubmit={handleCreateTask} className="space-y-6">
            
            {/* 1. TITLE */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Task Title</label>
              <input name="title" required placeholder="e.g. Follow us on Instagram" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 focus:border-kasi-gold outline-none transition font-bold" />
            </div>

            {/* 2. SHORT DESCRIPTION (Step 1 Modal) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase flex items-center gap-1">
                 <FileText size={12}/> Short Description (Step 1)
              </label>
              <input name="description" required placeholder="e.g. Follow our page to get exclusive updates." className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-600 focus:border-kasi-gold outline-none transition text-sm" />
              <p className="text-[10px] text-gray-400 mt-1">Appears under the title before the user accepts the task.</p>
            </div>

            {/* 3. REWARD */}
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Reward (RM)</label>
                <input name="reward" type="number" step="0.01" required placeholder="0.50" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-green-600 focus:border-kasi-gold outline-none transition font-mono font-bold" />
            </div>

            {/* 4. PLATFORM (ICON) */}
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Platform (Icon)</label>
                <div className="relative">
                    <select 
                        name="platform" 
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 pl-10 rounded-xl text-gray-900 outline-none cursor-pointer appearance-none focus:border-kasi-gold transition"
                    >
                        <option value="none">General / None</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="twitter">X (Twitter)</option>
                    </select>
                    {/* Icon Preview */}
                    <div className="absolute top-3.5 left-3 text-gray-500 pointer-events-none">
                        {selectedPlatform === 'instagram' && <Instagram size={18} className="text-pink-600"/>}
                        {selectedPlatform === 'facebook' && <Facebook size={18} className="text-blue-600"/>}
                        {selectedPlatform === 'youtube' && <Youtube size={18} className="text-red-600"/>}
                        {selectedPlatform === 'tiktok' && <Music2 size={18} className="text-pink-500"/>}
                        {selectedPlatform === 'twitter' && <Twitter size={18} className="text-black"/>}
                        {selectedPlatform === 'none' && <Globe size={18} className="text-gray-400"/>}
                    </div>
                </div>
            </div>

            {/* 5. ACTION TYPE */}
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Action Type</label>
                <select name="type" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 outline-none cursor-pointer focus:border-kasi-gold transition">
                    <option value="social">Social Interaction</option>
                    <option value="download">Download App</option>
                    <option value="review">Write Review</option>
                </select>
            </div>

            {/* 6. LIMIT */}
            <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Max Completions (0 = Unlimited)</label>
                 <input name="limit" type="number" placeholder="0" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 focus:border-kasi-gold outline-none transition" />
            </div>

            {/* 7. EXPIRY DATE */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-600 mb-1 uppercase flex items-center gap-1">
                    <Clock size={14}/> Limited Time (Optional)
                </label>
                <input name="expiryDate" type="datetime-local" className="w-full bg-white border border-blue-200 p-3 rounded-xl text-gray-900 focus:border-kasi-gold outline-none mt-1" />
                <p className="text-[10px] text-blue-400 mt-2 font-medium">Leave blank if the task never expires.</p>
            </div>

            {/* 8. LINK */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Target Link</label>
              <input name="link" type="url" required placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-blue-600 focus:border-kasi-gold outline-none transition" />
            </div>

            {/* 9. INSTRUCTIONS (Step 2 Modal) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase flex items-center gap-1">
                 <List size={12}/> Detailed Instructions (Step 2)
              </label>
              <textarea 
                name="instructions" 
                required 
                placeholder="Step 1: Click link above...&#10;Step 2: Like the post...&#10;Step 3: Screenshot proof..." 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900 focus:border-kasi-gold outline-none h-32 resize-none leading-relaxed transition text-sm" 
              />
            </div>

            <button disabled={loading} className="w-full bg-kasi-dark text-white font-black py-4 rounded-xl mt-4 hover:bg-black transition flex justify-center items-center shadow-lg active:scale-95">
              {loading ? "Publishing..." : <><Plus size={20} className="mr-2"/> Publish Task</>}
            </button>

          </form>
        </div>
      </div>
  );
}