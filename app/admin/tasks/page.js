"use client";
import { useState } from "react";
import { addTask } from "../../../lib/tasks"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function AdminTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const newTask = {
      title: formData.get("title"),
      description: formData.get("description"),
      reward: parseFloat(formData.get("reward")), // Make sure it's a number
      link: formData.get("link"),
      type: formData.get("type"), // e.g., "social", "download"
    };

    const result = await addTask(newTask);

    if (result.success) {
      alert("Task Created Successfully!");
      e.target.reset(); // Clear form
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={() => router.push("/profile")} className="mb-6 flex items-center text-gray-400 hover:text-white">
        <ArrowLeft size={20} className="mr-2" /> Back to App
      </button>

      <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-[#D4AF37]">Create New Task</h1>
        
        <form onSubmit={handleCreateTask} className="space-y-4">
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Task Title</label>
            <input name="title" required placeholder="e.g. Like KasiJobs Instagram" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-[#D4AF37] outline-none" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea name="description" required placeholder="Instructions for user..." className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-[#D4AF37] outline-none h-24" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reward ($)</label>
              <input name="reward" type="number" step="0.01" required placeholder="0.50" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-[#D4AF37] outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select name="type" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white outline-none">
                <option value="social">Social Media</option>
                <option value="download">App Download</option>
                <option value="survey">Survey</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Link</label>
            <input name="link" type="url" required placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-white focus:border-[#D4AF37] outline-none" />
          </div>

          <button disabled={loading} className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl mt-4 hover:bg-yellow-500 transition flex justify-center items-center">
            {loading ? "Publishing..." : <><Plus size={20} className="mr-2"/> Publish Task</>}
          </button>

        </form>
      </div>
    </div>
  );
}