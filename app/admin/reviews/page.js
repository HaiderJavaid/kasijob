"use client";
import { useState, useEffect } from "react";
import { getPendingSubmissions, reviewSubmission } from "../../../lib/tasks"; // Adjust path
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export default function AdminReviewPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Pending Tasks
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getPendingSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  const handleReview = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this task?`)) return;

    const result = await reviewSubmission(id, action);
    if (result.success) {
      alert(action === "approved" ? "User has been paid!" : "Submission rejected.");
      loadData(); // Refresh list
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button onClick={() => router.push("/profile")} className="mb-6 flex items-center text-gray-400 hover:text-white">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-6 text-[#D4AF37]">Review Submissions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-500">No pending submissions.</p>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{sub.taskTitle}</h3>
                  <p className="text-sm text-gray-400">User ID: {sub.userId}</p>
                </div>
                <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded">
                  Reward: ${sub.reward}
                </span>
              </div>

              <div className="bg-black/30 p-3 rounded-lg mb-4 font-mono text-sm text-gray-300">
                {sub.proof}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleReview(sub.id, "approved")}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Approve & Pay
                </button>
                <button 
                  onClick={() => handleReview(sub.id, "rejected")}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}