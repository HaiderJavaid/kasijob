"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getCurrentUser } from "../../lib/auth"; 
import { getActiveTasks, submitTaskProof, getUserSubmissions } from "../../lib/tasks";
import { performDailyCheckIn } from "../../lib/gamification";
import { 
  ChevronRight, Clock, CheckCircle, XCircle, Gift, Zap, 
  Share2, Download, MessageCircle, Star, AlertCircle, Upload, X 
} from "lucide-react";

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null); // State for the countdown string
  
  // UI State
  const [activeTab, setActiveTab] = useState("available");
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofInput, setProofInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // TIMER LOGIC: Update countdown every second
useEffect(() => {
  if (!user?.lastCheckIn) return;

  const interval = setInterval(() => {
    const lastCheckInTime = user.lastCheckIn.toDate().getTime();
    const now = new Date().getTime();
    const cooldown = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds
    const distance = lastCheckInTime + cooldown - now;

    if (distance < 0) {
      setTimeLeft(null); // Timer finished, button becomes clickable
      clearInterval(interval);
    } else {
      // Calculate hours, minutes, seconds
      const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const m = Math.floor((distance / (1000 * 60)) % 60);
      const s = Math.floor((distance / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [user]);

  // --- 1. INITIALIZE DATA ---
  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser); // Update state

          // FETCH TASKS
          const allTasks = await getActiveTasks();
          
          // FETCH USER HISTORY using 'currentUser' (NOT 'user' state)
          const userSubs = await getUserSubmissions(currentUser.uid);
          setMySubmissions(userSubs);

          // FILTER AVAILABLE TASKS
          const submittedTaskIds = userSubs.map(sub => sub.taskId);
          const available = allTasks.filter(task => !submittedTaskIds.includes(task.id));
          setTasks(available);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- 2. HANDLE SUBMIT TASK ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofInput) return alert("Please provide proof!");
    if (!user) return alert("You must be logged in.");

    setIsSubmitting(true);
    
    const result = await submitTaskProof(
      user.uid, 
      selectedTask.id, 
      selectedTask.title,
      selectedTask.reward,
      proofInput
    );

    if (result.success) {
      alert("Task submitted for review!");
      // Update local lists immediately
      setMySubmissions([...mySubmissions, { 
        taskId: selectedTask.id, 
        taskTitle: selectedTask.title, 
        reward: selectedTask.reward,
        status: "pending", 
        proof: proofInput 
      }]);
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      
      setSelectedTask(null);
      setProofInput("");
    } else {
      alert("Error: " + result.error);
    }
    setIsSubmitting(false);
  };

  // --- 3. HANDLE DAILY CHECK-IN ---
  const handleCheckIn = async () => {
    if (!user) return; // Safety check
    setCheckInLoading(true);
    
    const result = await performDailyCheckIn(user.uid);
    
    if (result.success) {
      alert(`Success! You earned RM ${result.reward.toFixed(2)}`);
      window.location.reload(); 
    } else {
      alert(result.error);
    }
    setCheckInLoading(false);
  };

  // --- 4. HELPER: ICONS ---
  const getTaskIcon = (type) => {
    switch(type) {
      case 'download': return <Download size={20} className="text-blue-600" />;
      case 'social': return <Share2 size={20} className="text-pink-500" />;
      case 'review': return <Star size={20} className="text-yellow-500" />;
      case 'comment': return <MessageCircle size={20} className="text-purple-500" />;
      default: return <Zap size={20} className="text-gray-600" />;
    }
  };

  return (
  <div className="min-h-screen bg-kasi-gray pb-24 relative font-sans">
    
    {/* HEADER */}
    <div className="bg-kasi-dark pt-8 pb-20 px-6 rounded-b-[2.5rem] shadow-lg">
      <h1 className="text-white text-2xl font-black">Tasks</h1>
      <p className="text-kasi-subtle text-sm">Complete tasks, earn cash.</p>
    </div>

    {/* CONTAINER FOR CONTENT */}
    <div className="px-5 -mt-12 space-y-6">

      {/* 1. DAILY CHECK-IN CARD (Floating at top) */}
      <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center justify-between border-b-4 border-yellow-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${timeLeft ? "bg-gray-100 text-gray-400" : "bg-yellow-50 text-yellow-600 animate-bounce"}`}>
            <Gift size={24} />
          </div>
          <div>
            <h3 className="font-black text-kasi-dark text-base">Daily Bonus</h3>
            <p className="text-xs text-gray-400">
              {timeLeft ? "Come back tomorrow" : "Claim free money!"}
            </p>
          </div>
        </div>
        
        {/* BUTTON TURNS INTO TIMER */}
        <button 
          onClick={handleCheckIn}
          disabled={!!timeLeft || checkInLoading || !user}
          className={`text-xs font-black px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 ${
            timeLeft 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" // Timer Style
              : "bg-kasi-gold text-kasi-dark active:scale-95 hover:shadow-lg" // Active Style
          }`}
        >
          {checkInLoading ? "..." : timeLeft ? (
            <><Clock size={14}/> {timeLeft}</> 
          ) : (
            "Claim RM0.10"
          )}
        </button>
      </div>

      {/* 2. TABS (Now below the Check-in Card) */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setActiveTab("available")} 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "available" ? "bg-kasi-gold text-kasi-dark shadow-sm" : "text-gray-400 hover:bg-gray-50"}`}
          >
            Available
          </button>
          <button 
            onClick={() => setActiveTab("history")} 
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === "history" ? "bg-kasi-gold text-kasi-dark shadow-sm" : "text-gray-400 hover:bg-gray-50"}`}
          >
            My Status
          </button>
      </div>

      {/* 3. TASK LIST (Content based on Tab) */}
     {/* 3. TASK LIST (Available) */}
      {activeTab === "available" && (
          <div className="space-y-3">
             {loading ? (
                <p className="text-center text-gray-400 py-10">Loading...</p> 
             ) : tasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No tasks available right now.</div>
             ) : (
                tasks.map((task) => (
                    <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)} 
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon Helper */}
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100">
                                {getTaskIcon(task.type)}
                            </div>
                            <div>
                                <h3 className="text-kasi-dark font-bold text-sm line-clamp-1">{task.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{task.type}</span>
                                  <p className="text-kasi-subtle text-xs line-clamp-1">{task.description}</p>
                                </div>
                            </div>
                        </div>
                        <span className="block text-kasi-gold font-black text-base">+RM{task.reward}</span>
                    </div>
                ))
             )}
          </div>
      )}

      {/* 4. HISTORY LIST (My Status) */}
      {activeTab === "history" && (
          <div className="space-y-3">
             {mySubmissions.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No submissions yet.</p> 
             ) : (
                mySubmissions.map((sub, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between opacity-90">
                        <div>
                            <h3 className="text-kasi-dark font-bold text-sm">{sub.taskTitle}</h3>
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">Proof: {sub.proof}</p>
                        </div>
                        <div>
                            {sub.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Clock size={10}/> Review</span>}
                            {sub.status === 'approved' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10}/> Paid</span>}
                            {sub.status === 'rejected' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><XCircle size={10}/> Failed</span>}
                        </div>
                    </div>
                ))
             )}
          </div>
      )}

    </div>
    
    {/* 5. TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
            
            {/* Modal Content */}
            <div className="bg-white w-full max-w-md m-4 rounded-3xl p-6 relative z-10 animate-slide-up">
                <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
                    <X size={20} className="text-kasi-dark"/>
                </button>

                <div className="mb-6">
                    <span className="bg-kasi-gold text-kasi-dark text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{selectedTask.type}</span>
                    <h2 className="text-2xl font-black text-kasi-dark mt-2">{selectedTask.title}</h2>
                    <p className="text-kasi-dark font-bold text-xl mt-1 text-[#D4AF37]">Reward: RM {selectedTask.reward}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                    <h3 className="text-sm font-bold text-kasi-dark mb-2 flex items-center gap-2"><AlertCircle size={16}/> Instructions:</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                    <a href={selectedTask.link} target="_blank" className="block mt-4 text-center w-full bg-kasi-dark text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Go to Task Link</a>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Proof of Completion</label>
                    <textarea 
                        required 
                        value={proofInput} 
                        onChange={(e) => setProofInput(e.target.value)} 
                        placeholder="Paste code, username, or caption here..." 
                        className="w-full bg-white border-2 border-gray-200 focus:border-kasi-gold rounded-xl p-3 text-sm text-kasi-dark outline-none h-24 mb-3 resize-none"
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-kasi-gold text-kasi-dark font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-70"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Task"}
                    </button>
                </form>
            </div>
        </div>
      )}
  </div>
);
}