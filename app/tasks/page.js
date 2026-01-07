"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getCurrentUser } from "../../lib/auth"; 
import { getActiveTasks, submitTaskProof, getUserSubmissions } from "../../lib/tasks";
import { performDailyCheckIn } from "../../lib/gamification";
import { 
  Clock, CheckCircle, XCircle, Gift, Zap, 
  Share2, Download, MessageCircle, Star, AlertCircle, X, ExternalLink, ArrowRight, CheckSquare,
  Globe, Gamepad2 // New icons for partners
} from "lucide-react";

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null); 
  
  // Notification State
  const [newTasksCount, setNewTasksCount] = useState(0);
  const [updatesCount, setUpdatesCount] = useState(0);

  // UI State
  const [taskMode, setTaskMode] = useState("inhouse"); // 'inhouse' or 'partners'
  const [activeTab, setActiveTab] = useState("available"); // 'available' or 'history'
  
  // Wizard State
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalStep, setModalStep] = useState(1); 
  const [linkClicked, setLinkClicked] = useState(false); 
  
  const [proofInput, setProofInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // HELPER: Check if a date is NEWER than last visit
  const isNew = (firebaseTimestamp, type) => {
    if (!firebaseTimestamp) return false;
    if (typeof window === 'undefined') return false; // SSR Safety

    const lastVisit = parseInt(localStorage.getItem(`kasi_last_visit_${type}`) || "0");
    let itemTime;
    try {
        if (firebaseTimestamp.toDate) {
            itemTime = firebaseTimestamp.toDate().getTime();
        } else if (firebaseTimestamp.seconds) {
            itemTime = firebaseTimestamp.seconds * 1000;
        } else {
            itemTime = new Date(firebaseTimestamp).getTime();
        }
    } catch (e) { return false; }

    const isRecent = (Date.now() - itemTime) < (48 * 60 * 60 * 1000);
    return itemTime > lastVisit && isRecent;
  };

  // 1. TIMER LOGIC (Runs every second)
  useEffect(() => {
    if (!user) return; 

    const calculateTimeLeft = () => {
        if (!user.lastCheckIn) {
            if (!timeLeft) setTimeLeft(null);
            return;
        }

        let lastCheckInTime;
        try {
            if (typeof user.lastCheckIn.toDate === 'function') {
                lastCheckInTime = user.lastCheckIn.toDate().getTime();
            } else if (user.lastCheckIn.seconds) {
                lastCheckInTime = user.lastCheckIn.seconds * 1000;
            } else {
                lastCheckInTime = new Date(user.lastCheckIn).getTime();
            }
        } catch (e) { return; }

        const now = new Date().getTime();
        const distance = lastCheckInTime + (24 * 60 * 60 * 1000) - now;

        if (distance < 0) {
            setTimeLeft(null); 
        } else {
            const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const m = Math.floor((distance / (1000 * 60)) % 60);
            const s = Math.floor((distance / 1000) % 60); 
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // 2. INITIALIZE DATA & NOTIFICATIONS
  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const allTasks = await getActiveTasks();
          const userSubs = await getUserSubmissions(currentUser.uid);
          setMySubmissions(userSubs);
          
          const submittedTaskIds = userSubs.map(sub => sub.taskId);
          const available = allTasks.filter(task => !submittedTaskIds.includes(task.id));
          setTasks(available);

          // NOTIFICATIONS
          const newT = available.filter(t => isNew(t.createdAt, 'available')).length;
          const newU = userSubs.filter(s => isNew(s.reviewedAt, 'history')).length;
          
          setNewTasksCount(newT);
          setUpdatesCount(newU);

          if (newT > 0 || newU > 0) {
            localStorage.setItem("kasi_task_alert", "true");
            window.dispatchEvent(new Event("kasi_notif_update"));
          }
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- HANDLE TAB CHANGE (Clear Notification on Click) ---
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem(`kasi_last_visit_${tabName === 'available' ? 'available' : 'history'}`, Date.now().toString());

    if (tabName === "available") setNewTasksCount(0);
    else setUpdatesCount(0);

    if ((tabName === "available" && updatesCount === 0) || (tabName === "history" && newTasksCount === 0)) {
       localStorage.setItem("kasi_task_alert", "false");
       window.dispatchEvent(new Event("kasi_notif_update"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofInput) return alert("Please provide proof!");
    
    setIsSubmitting(true);
    const result = await submitTaskProof(
      user.uid, 
      selectedTask.id, 
      selectedTask.title,
      selectedTask.reward,
      proofInput,
      selectedTask.readableId
    );

    if (result.success) {
      setMySubmissions([{ 
        taskId: selectedTask.id, 
        taskTitle: selectedTask.title, 
        reward: selectedTask.reward,
        readableId: selectedTask.readableId,
        status: "pending", 
        proof: proofInput,
        submittedAt: { toDate: () => new Date() }
      }, ...mySubmissions]);
      
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    } else {
      alert("Error: " + result.error);
    }
    setIsSubmitting(false);
  };

 const handleCheckIn = async () => {
    if (!user) return;
    setCheckInLoading(true);
    const result = await performDailyCheckIn(user.uid);
    if (result.success) {
      alert(`Success! RM ${result.reward.toFixed(2)} added to your wallet.`);
      const now = new Date();
      setTimeLeft("23h 59m 59s"); 
      setUser(prev => ({ 
          ...prev, 
          lastCheckIn: { toDate: () => now }, 
          balance: (prev.balance || 0) + result.reward 
      }));
    } else {
      alert(result.error);
    }
    setCheckInLoading(false);
  };

  const getTaskIcon = (type) => {
    switch(type) {
      case 'download': return <Download size={20} className="text-blue-600" />;
      case 'social': return <Share2 size={20} className="text-pink-500" />;
      case 'review': return <Star size={20} className="text-yellow-500" />;
      default: return <Zap size={20} className="text-gray-600" />;
    }
  };

  const openTask = (task) => {
    setSelectedTask(task);
    setModalStep(1);
    setLinkClicked(false);
    setProofInput("");
  };

  const handleLinkClick = () => {
    window.open(selectedTask.link, "_blank");
    setLinkClicked(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    let date;
    try {
        date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    } catch(e) { return "Date Error"; }
    return date.toLocaleDateString("en-MY", { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 relative font-sans">
      
      {/* HEADER */}
      <div className="bg-kasi-dark pt-8 pb-20 px-6 rounded-b-[2.5rem] shadow-lg">
        <h1 className="text-white text-2xl font-black">Earn Cash</h1>
        <p className="text-kasi-subtle text-sm">Select your earning method below.</p>
      </div>

      <div className="px-5 -mt-12 space-y-6">
        
        {/* --- PARTNERS TOGGLE (SWITCH BETWEEN IN-HOUSE AND PARTNERS) --- */}
        <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl">
            <button 
                onClick={() => setTaskMode('inhouse')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${taskMode === 'inhouse' ? 'bg-kasi-gold text-kasi-dark shadow-lg scale-[1.02]' : 'text-white/60 hover:text-white'}`}
            >
                <Zap size={16} fill={taskMode === 'inhouse' ? "currentColor" : "none"} /> In-House
            </button>
            <button 
                onClick={() => setTaskMode('partners')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${taskMode === 'partners' ? 'bg-kasi-gold text-kasi-dark shadow-lg scale-[1.02]' : 'text-white/60 hover:text-white'}`}
            >
                <Globe size={16} /> Partners
            </button>
        </div>

        {/* --- IN-HOUSE MODE CONTENT --- */}
        {taskMode === "inhouse" && (
            <div className="space-y-6 animate-fade-in">
                {/* DAILY CHECK-IN CARD */}
                <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-between border-b-4 border-yellow-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${timeLeft ? "bg-gray-100 text-gray-400" : "bg-yellow-50 text-yellow-600 animate-bounce"}`}>
                            <Gift size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-kasi-dark text-base">Daily Bonus</h3>
                            <p className="text-xs text-gray-400">{timeLeft ? "Come back tomorrow" : "Claim free money!"}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCheckIn} 
                        disabled={!!timeLeft || checkInLoading || !user} 
                        className={`text-xs font-black px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 ${timeLeft ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-kasi-gold text-kasi-dark active:scale-95"}`}
                    >
                        {checkInLoading ? "..." : timeLeft ? <><Clock size={14}/> {timeLeft}</> : "Claim RM0.10"}
                    </button>
                </div>

                {/* TABS (Available/Status) */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm">
                    <button 
                        onClick={() => handleTabChange("available")} 
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all relative ${activeTab === "available" ? "bg-kasi-gold text-kasi-dark shadow-sm" : "text-gray-400 hover:bg-gray-50"}`}
                    >
                        Available
                        {newTasksCount > 0 && <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                    </button>
                    <button 
                        onClick={() => handleTabChange("history")} 
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all relative ${activeTab === "history" ? "bg-kasi-gold text-kasi-dark shadow-sm" : "text-gray-400 hover:bg-gray-50"}`}
                    >
                        My Status
                        {updatesCount > 0 && <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                    </button>
                </div>

                {/* LISTS */}
                {activeTab === "available" ? (
                    <div className="space-y-3">
                        {loading ? <p className="text-center text-gray-400 py-10">Loading...</p> : tasks.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">No tasks available.</div> : (
                            tasks.map((task) => (
                                <div key={task.id} onClick={() => openTask(task)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform relative overflow-hidden group">
                                    {isNew(task.createdAt, 'available') && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md z-10 animate-pulse">NEW!</div>}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 shrink-0">{getTaskIcon(task.type)}</div>
                                            <div>
                                                <h3 className="text-kasi-dark font-bold text-sm line-clamp-1">{task.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{task.type}</span>
                                                    <span className="text-[9px] font-mono text-gray-300">#{task.readableId || '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-l font-black text-kasi-gold" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>+RM{task.reward}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-50 text-kasi-dark text-xs font-bold py-2 rounded-lg text-center group-hover:bg-kasi-dark group-hover:text-white transition-colors flex items-center justify-center gap-1">View Details <ArrowRight size={12} /></div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mySubmissions.map((sub, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between opacity-90 relative overflow-hidden">
                                {isNew(sub.reviewedAt, 'history') && <span className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-kasi-dark font-bold text-sm">{sub.taskTitle}</h3>
                                        <span className="text-[9px] font-mono text-gray-300">#{sub.readableId || '---'}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {formatDate(sub.submittedAt)}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="block font-black text-sm text-kasi-gold" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>+ RM {sub.reward?.toFixed(2) || "0.00"}</span>
                                    {sub.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full inline-block">Reviewing</span>}
                                    {sub.status === 'approved' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full inline-block">Paid</span>}
                                    {sub.status === 'rejected' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full inline-block">Rejected</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- PARTNERS MODE CONTENT --- */}
        {taskMode === "partners" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                {/* Torox Card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-kasi-gold transition group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl">HOT</div>
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Gamepad2 className="text-red-500" size={28}/>
                    </div>
                    <h3 className="font-black text-kasi-dark text-sm">Torox</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Games & Apps</p>
                    <button className="w-full bg-kasi-dark text-white text-xs font-bold py-2 rounded-lg shadow-md active:scale-95">Open Wall</button>
                </div>

                {/* BitLabs Card */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-kasi-gold transition group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl">EASY</div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Globe className="text-blue-500" size={28}/>
                    </div>
                    <h3 className="font-black text-kasi-dark text-sm">BitLabs</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Surveys</p>
                    <button className="w-full bg-kasi-dark text-white text-xs font-bold py-2 rounded-lg shadow-md active:scale-95">Open Wall</button>
                </div>

                {/* CPX Research */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-kasi-gold transition group cursor-pointer relative overflow-hidden">
                    <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Star className="text-yellow-600" size={28}/>
                    </div>
                    <h3 className="font-black text-kasi-dark text-sm">CPX Research</h3>
                    <p className="text-[10px] text-gray-400 mb-3">Quick Surveys</p>
                    <button className="w-full bg-kasi-dark text-white text-xs font-bold py-2 rounded-lg shadow-md active:scale-95">Open Wall</button>
                </div>
            </div>
        )}
      </div>

      {/* --- WIZARD MODAL --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
            <div className="bg-white w-full max-w-md rounded-3xl p-6 relative z-10 animate-slide-up overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-1">
                        <div className={`h-1 w-8 rounded-full ${modalStep >= 1 ? "bg-kasi-gold" : "bg-gray-200"}`}></div>
                        <div className={`h-1 w-8 rounded-full ${modalStep >= 2 ? "bg-kasi-gold" : "bg-gray-200"}`}></div>
                        <div className={`h-1 w-8 rounded-full ${modalStep >= 3 ? "bg-kasi-gold" : "bg-gray-200"}`}></div>
                    </div>
                    <button onClick={() => setSelectedTask(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>

                {modalStep === 1 && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-kasi-gold">{getTaskIcon(selectedTask.type)}</div>
                            <h2 className="text-2xl font-black text-kasi-dark leading-tight">{selectedTask.title}</h2>
                            <p className="text-gray-400 text-sm mt-2">{selectedTask.type} Task</p>
                        </div>
                        <div className="bg-kasi-dark text-white p-4 rounded-2xl flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-400">Reward</span>
                            <span className="text-2xl font-black text-kasi-gold">RM {selectedTask.reward}</span>
                        </div>
                        <button onClick={() => setModalStep(2)} className="w-full bg-kasi-gold text-kasi-dark font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2">Accept Challenge <ArrowRight size={20}/></button>
                    </div>
                )}

                {modalStep === 2 && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-black text-kasi-dark mb-4">Instructions</h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 max-h-60 overflow-y-auto"><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p></div>
                        <div className="space-y-3">
                            <button onClick={handleLinkClick} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition border-2 ${linkClicked ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-blue-100 text-blue-600 hover:bg-blue-50"}`}>{linkClicked ? <><CheckCircle size={18}/> Link Opened</> : <><ExternalLink size={18}/> Go to Task Link</>}</button>
                            <button onClick={() => setModalStep(3)} disabled={!linkClicked} className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition ${linkClicked ? "bg-kasi-gold text-kasi-dark shadow-lg active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>Next Step <ArrowRight size={20}/></button>
                        </div>
                    </div>
                )}

                {modalStep === 3 && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-black text-kasi-dark mb-1">Submit Proof</h3>
                        <p className="text-xs text-gray-400 mb-4">Paste the required code, username, or details.</p>
                        <form onSubmit={handleSubmit}>
                            <textarea required autoFocus value={proofInput} onChange={(e) => setProofInput(e.target.value)} placeholder="Example: Done liked as @username..." className="w-full bg-white border-2 border-gray-200 focus:border-kasi-gold rounded-xl p-4 text-sm text-kasi-dark outline-none h-32 mb-4 resize-none"/>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-kasi-dark text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-70">{isSubmitting ? "Verifying..." : "Submit Task"}</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}