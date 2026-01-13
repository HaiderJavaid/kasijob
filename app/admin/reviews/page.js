"use client";
import { useState, useEffect } from "react";
// KEEP your existing imports
import { getPendingSubmissions, reviewSubmission, getTaskById } from "../../../lib/tasks"; // Make sure getTaskById is exported from here!
import { useRouter } from "next/navigation";
// ADD these new icons
import { ArrowLeft, CheckCircle, XCircle, Eye, FileText, X, ExternalLink, Loader2 } from "lucide-react";

export default function AdminReviewPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for Modals
  const [viewImage, setViewImage] = useState(null);
  const [viewTask, setViewTask] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getPendingSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  // --- NEW FUNCTION: Handle Viewing Private R2 Images ---
  const handleViewProof = async (proofString) => {
    // If user just typed text (e.g. "Done"), show alert
    if (!proofString.includes('proofs/')) {
        return alert("User Text Proof:\n\n" + proofString);
    }

    // If it's a file key, get the secure link
    try {
      const res = await fetch(`/api/r2?key=${proofString}`);
      const data = await res.json();
      if (data.viewUrl) setViewImage(data.viewUrl);
      else alert("Error: Could not retrieve image link.");
    } catch (e) {
      console.error(e);
      alert("System Error loading image.");
    }
  };

  const handleReview = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this task?`)) return;

    const result = await reviewSubmission(id, action);
    if (result.success) {
      // Close modals if they are open
      setViewImage(null); 
      loadData(); 
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37]">Admin Review</h1>
          <p className="text-gray-400 text-sm">Validating {submissions.length} pending submissions</p>
        </div>
        <button onClick={() => router.push("/profile")} className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2 border border-gray-700">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* TABLE VIEW (Replaces your old Grid View) */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/50 text-gray-400 uppercase font-bold text-xs tracking-wider border-b border-gray-700">
              <tr>
                <th className="p-4">Task Info</th>
                <th className="p-4">User</th>
                <th className="p-4">Proof</th>
                <th className="p-4 text-right">Reward</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/>Loading data...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500">No pending submissions found.</td></tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-700/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white truncate max-w-[180px]">{sub.taskTitle}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{sub.taskId}</div>
                    </td>
                    <td className="p-4">
                        <span className="text-gray-300 font-mono text-xs bg-black/20 px-2 py-1 rounded">{sub.userId.substring(0,6)}...</span>
                    </td>
                    <td className="p-4">
                        <button 
                          onClick={() => handleViewProof(sub.proof)}
                          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-600 transition"
                        >
                          <Eye size={14} /> View Proof
                        </button>
                    </td>
                    <td className="p-4 text-right font-bold text-[#D4AF37]">RM {sub.reward?.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleReview(sub.id, "approved")} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg transition" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleReview(sub.id, "rejected")} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: VIEW PROOF IMAGE --- */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setViewImage(null)}>
          <div className="relative max-w-5xl max-h-full">
            <button onClick={() => setViewImage(null)} className="absolute -top-12 right-0 text-white hover:text-red-500 transition"><X size={32}/></button>
            <img src={viewImage} alt="Proof" className="rounded-lg shadow-2xl max-h-[85vh] object-contain border border-gray-700 bg-black" />
            <p className="text-center text-gray-400 mt-2 text-sm">Click anywhere to close</p>
          </div>
        </div>
      )}

    </div>
  );
}