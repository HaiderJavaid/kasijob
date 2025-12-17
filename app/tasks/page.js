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
      {activeTab === "available" && (
          <div className="space-y-3">
             {/* ... Your Existing Task Mapping Logic ... */}
             {/* ... */}
          </div>
      )}

      {activeTab === "history" && (
          <div className="space-y-3">
             {/* ... Your Existing History Mapping Logic ... */}
             {/* ... */}
          </div>
      )}

    </div>
    
    {/* ... Modal Logic ... */}
  </div>
);
}