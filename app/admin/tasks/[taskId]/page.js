"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { db } from "@/lib/firebase"; 
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore"; // Added updateDoc, Timestamp
import { reviewSubmission } from "@/lib/tasks"; 
import { 
  ArrowLeft, Users, CheckCircle, XCircle, ExternalLink, Eye, X, Loader2, 
  Save, Edit2, Clock, Globe, FileText, List, Trash2,
  Instagram, Facebook, Youtube, Twitter, Music2 
} from "lucide-react";

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.taskId; 

  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // EDIT STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // MODAL STATE
  const [viewProof, setViewProof] = useState(null);

  useEffect(() => {
    if (taskId) fetchData();
  }, [taskId]);

 const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Task
      const taskSnap = await getDoc(doc(db, "tasks", taskId));
      if (!taskSnap.exists()) {
         alert("Task not found");
         router.push("/admin/tasks");
         return;
      }
      const taskData = { id: taskSnap.id, ...taskSnap.data() };
      setTask(taskData);
      
      // Initialize Edit Form (Convert Timestamp to string for input)
      let expiryStr = "";
      if (taskData.expiryDate) {
          // Convert Firestore Timestamp to "YYYY-MM-DDTHH:MM" for datetime-local input
          const date = taskData.expiryDate.toDate ? taskData.expiryDate.toDate() : new Date(taskData.expiryDate);
          // Handle timezone offset for correct input display
          const offset = date.getTimezoneOffset() * 60000;
          expiryStr = new Date(date.getTime() - offset).toISOString().slice(0, 16);
      }

      setEditForm({
          ...taskData,
          expiryDate: expiryStr,
          platform: taskData.platform || "none",
          limit: taskData.limit || 0
      });

      // 2. Get Submissions
      const q = query(collection(db, "submissions"), where("taskId", "==", taskId));
      const subSnap = await getDocs(q);
      
      const rawSubs = subSnap.docs.map(d => ({ 
        id: d.id, ...d.data(), 
        submittedAtDate: d.data().submittedAt?.toDate ? d.data().submittedAt.toDate() : new Date() 
      }));

      // 3. Get User Names
      const userIds = [...new Set(rawSubs.map(s => s.userId))];
      const userPromises = userIds.map(uid => getDoc(doc(db, "users", uid)));
      const userSnaps = await Promise.all(userPromises);
      
      const userMap = {};
      userSnaps.forEach(snap => {
        if (snap.exists()) {
            const data = snap.data();
            userMap[snap.id] = data.displayName || data.email || "Unknown User";
        }
      });

      const combined = rawSubs.map(sub => ({
        ...sub,
        userName: userMap[sub.userId] || "Anonymous"
      }));

      combined.sort((a, b) => b.submittedAtDate - a.submittedAtDate);
      setSubmissions(combined);

    } catch (error) {
      console.error(error);
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE CHANGES ---
  const handleSaveTask = async () => {
      if(!confirm("Save changes to this task?")) return;
      setIsSaving(true);
      try {
          const taskRef = doc(db, "tasks", taskId);
          
          // Prepare Data
          const updates = {
              title: editForm.title,
              description: editForm.description,
              instructions: editForm.instructions || "",
              reward: Number(editForm.reward),
              limit: Number(editForm.limit),
              link: editForm.link,
              type: editForm.type,
              platform: editForm.platform,
              // Convert Date String back to Timestamp
              expiryDate: editForm.expiryDate ? Timestamp.fromDate(new Date(editForm.expiryDate)) : null
          };

          await updateDoc(taskRef, updates);
          
          setTask({ ...task, ...updates }); // Update UI
          setIsEditing(false);
          alert("Task updated successfully!");
      } catch (e) {
          console.error(e);
          alert("Error updating task: " + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  // --- R2 VIEWER ---
  const handleViewProof = async (proofString) => {
    if (!proofString || !proofString.includes('proofs/')) {
        return alert("Text Proof:\n\n" + (proofString || "No proof provided"));
    }
    try {
      const res = await fetch(`/api/r2?key=${proofString}`);
      const data = await res.json();
      if (data.viewUrl) setViewProof(data.viewUrl);
      else alert("Error loading image.");
    } catch (e) {
      console.error(e);
      alert("System Error.");
    }
  };

  // --- REVIEW ACTION ---
  const handleReview = async (subId, action) => {
    if (!confirm(`Confirm ${action}?`)) return;
    
    // Optimistic Update (Make UI snappy)
    setSubmissions(prev => prev.map(sub => 
        sub.id === subId ? { ...sub, status: action === 'approved' ? 'approved' : 'rejected' } : sub
    ));

    const result = await reviewSubmission(subId, action);
    if (!result.success) {
      alert("Error: " + result.error);
      fetchData(); // Revert on error
    }
  };

  if (loading) return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-gray-500 gap-4">
          <Loader2 className="animate-spin w-10 h-10 text-kasi-gold"/> 
          <p>Loading Task...</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={16}/> Back to List
        </button>
        <div className="flex gap-2">
            {isEditing ? (
                <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSaveTask} disabled={isSaving} className="px-4 py-2 bg-kasi-gold text-kasi-dark rounded-xl font-bold text-sm hover:bg-yellow-500 flex items-center gap-2">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save Changes
                    </button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                    <Edit2 size={16}/> Edit Task
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: TASK EDITOR */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                    Task Settings {isEditing && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded ml-2">Editing</span>}
                </h2>
                
                <div className="space-y-4">
                    {/* TITLE */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Title</label>
                        {isEditing ? (
                            <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg font-bold" />
                        ) : (
                            <p className="font-bold text-gray-900">{task.title}</p>
                        )}
                    </div>

                    {/* REWARD & LIMIT */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Reward</label>
                            {isEditing ? (
                                <input type="number" step="0.01" value={editForm.reward} onChange={e => setEditForm({...editForm, reward: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg font-bold text-green-600" />
                            ) : (
                                <p className="font-bold text-green-600">RM {task.reward}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Limit</label>
                            {isEditing ? (
                                <input type="number" value={editForm.limit} onChange={e => setEditForm({...editForm, limit: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg font-bold" />
                            ) : (
                                <p className="font-bold text-gray-900">{task.limit || "Unlimited"}</p>
                            )}
                        </div>
                    </div>

                    {/* PLATFORM & TYPE */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Platform</label>
                            {isEditing ? (
                                <select value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-sm">
                                    <option value="none">None</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="twitter">X (Twitter)</option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {task.platform === 'instagram' && <Instagram size={16} className="text-pink-600"/>}
                                    {task.platform === 'facebook' && <Facebook size={16} className="text-blue-600"/>}
                                    {task.platform === 'youtube' && <Youtube size={16} className="text-red-600"/>}
                                    <span className="text-sm capitalize font-bold">{task.platform}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Type</label>
                            {isEditing ? (
                                <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-sm">
                                    <option value="social">Social</option>
                                    <option value="download">Download</option>
                                    <option value="review">Review</option>
                                </select>
                            ) : (
                                <span className="text-sm capitalize font-bold bg-gray-100 px-2 py-0.5 rounded">{task.type}</span>
                            )}
                        </div>
                    </div>

                    {/* LINK */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Target Link</label>
                        {isEditing ? (
                            <input value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-blue-600 text-xs" />
                        ) : (
                            <a href={task.link} target="_blank" className="text-blue-600 text-xs truncate block hover:underline flex items-center gap-1"><ExternalLink size={10}/> {task.link}</a>
                        )}
                    </div>

                     {/* EXPIRY */}
                     <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Expiry Date</label>
                        {isEditing ? (
                            <input type="datetime-local" value={editForm.expiryDate} onChange={e => setEditForm({...editForm, expiryDate: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-sm" />
                        ) : (
                            <p className="text-sm font-bold">{task.expiryDate ? new Date(task.expiryDate.toDate ? task.expiryDate.toDate() : task.expiryDate).toLocaleString() : "Permanent"}</p>
                        )}
                    </div>

                    <div className="border-t border-gray-100 my-4"></div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase flex items-center gap-1"><FileText size={12}/> Short Description</label>
                        {isEditing ? (
                            <textarea rows={2} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-sm" />
                        ) : (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{task.description || "N/A"}</p>
                        )}
                    </div>

                    {/* INSTRUCTIONS */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase flex items-center gap-1"><List size={12}/> Instructions</label>
                        {isEditing ? (
                            <textarea rows={4} value={editForm.instructions} onChange={e => setEditForm({...editForm, instructions: e.target.value})} className="w-full bg-gray-50 border p-2 rounded-lg text-sm" />
                        ) : (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{task.instructions || "N/A"}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COL: SUBMISSIONS TABLE */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-black text-gray-900">Submissions</h2>
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">{submissions.length} Total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Proof</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4 text-gray-400 text-xs whitespace-nowrap">
                                        {new Date(sub.submittedAtDate).toLocaleDateString()} <br/>
                                        {new Date(sub.submittedAtDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{sub.userName}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">{sub.userId.substring(0,8)}...</div>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleViewProof(sub.proof)} 
                                            className="flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                        >
                                            <Eye size={14}/> View
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        {sub.status === 'approved' ? <span className="text-green-700 bg-green-100 px-2 py-1 rounded font-bold text-xs">Paid</span> : 
                                         sub.status === 'rejected' ? <span className="text-red-700 bg-red-100 px-2 py-1 rounded font-bold text-xs">Rejected</span> :
                                         <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded font-bold text-xs">Pending</span>}
                                    </td>
                                    <td className="p-4 text-center flex justify-center gap-2">
                                        {sub.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleReview(sub.id, "approved")} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm border border-green-100"><CheckCircle size={16}/></button>
                                                <button onClick={() => handleReview(sub.id, "rejected")} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"><XCircle size={16}/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {submissions.length === 0 && <div className="p-10 text-center text-gray-400 italic">No submissions yet.</div>}
                </div>
            </div>
        </div>
      </div>

      {/* MODAL: VIEW PROOF (Z-INDEX FIXED) */}
      {viewProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setViewProof(null)}></div>
            <div className="relative z-10 animate-scale-up max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                <button onClick={() => setViewProof(null)} className="absolute -top-12 right-0 text-white hover:text-red-400 transition"><X size={32}/></button>
                <img src={viewProof} className="max-h-[85vh] rounded-lg shadow-2xl border border-gray-700 object-contain bg-black" alt="Proof" />
                <a href={viewProof} target="_blank" className="mt-4 text-white/50 text-xs hover:text-white underline">Open Original</a>
            </div>
        </div>
      )}
    </div>
  );
}