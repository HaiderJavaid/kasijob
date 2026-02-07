"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { getCurrentUser } from "../../lib/auth"; 
import { getActiveTasks, submitTaskProof } from "../../lib/tasks"; 
import AppTutorial from "../../components/AppTutorial"; 
import StreakBoard from "../../components/StreakBoard"; 
import { db } from "../../lib/firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { 
  Clock, Zap, Globe, Download, Share2, Star, Gift, 
  Camera, Loader2, Image as ImageIcon, Trash2, X, ArrowRight, 
  HelpCircle, ExternalLink, CheckCircle, Gamepad2,
  Instagram, Facebook, Youtube, Twitter, Music2 
} from "lucide-react";

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState("inhouse"); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalStep, setModalStep] = useState(1); 
  const [linkClicked, setLinkClicked] = useState(false); 
  const [proofInput, setProofInput] = useState("");
  const [proofFileKey, setProofFileKey] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- TUTORIAL STATE ---
  const [runTutorial, setRunTutorial] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  // 1. TUTORIAL STEPS
  const tutorialSteps = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-center">
          <h2 className="text-xl font-black mb-2">Welcome to KasiJobs! 🚀</h2>
          <p className="text-sm">Let's show you how to complete your first task.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '.tutorial-streak',
      content: 'Login every day to keep your streak alive and earn up to RM0.50 daily!',
      placement: 'bottom',
    },
    {
      target: '.tutorial-first-task',
      content: 'Click this task to view details. (We will open it for you now!)',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.tutorial-accept-btn',
      content: 'Step 1: Accept the challenge to see instructions.',
      placement: 'bottom',
    },
    {
      target: '.task-instruction-text', 
      content: 'Step 2: CAREFULLY read the instructions here before proceeding.',
      placement: 'bottom',
    },
    {
      target: '.tutorial-link-btn', 
      content: 'Step 3: Click the link to perform the task.',
      placement: 'top',
    },
    {
      target: '.tutorial-next-step-btn',
      content: 'After you are done, come back and click Next.',
      placement: 'top',
    },
    {
      target: '.tutorial-proof-area',
      content: 'Step 4: Upload a screenshot OR type the required text proof here.',
      placement: 'bottom',
    },
    {
      target: '.nav-item-profile',
      content: 'Great! Now click here to go to your Profile.',
      placement: 'top',
      disableBeacon: true,
      hideFooter: true,
      spotlightClicks: true,
    }
  ];

  // 2. HELPER FUNCTIONS
  const getTaskIcon = (task) => {
      switch(task.platform?.toLowerCase()) {
          case 'instagram': return <Instagram size={24} className="text-pink-600" />;
          case 'facebook': return <Facebook size={24} className="text-blue-600" />;
          case 'youtube': return <Youtube size={24} className="text-red-600" />;
          case 'twitter': return <Twitter size={24} className="text-black" />;
          case 'tiktok': return <Music2 size={24} className="text-pink-500" />;
      }
      switch(task.type) { 
          case 'download': return <Download size={20} className="text-blue-600" />; 
          case 'social': return <Share2 size={20} className="text-pink-500" />; 
          case 'review': return <Star size={20} className="text-yellow-500" />; 
          default: return <Zap size={20} className="text-gray-600" />; 
      } 
  };

  const getTimeLeftBadge = (expiryTimestamp) => {
      if (!expiryTimestamp) return null;
      const now = new Date().getTime();
      let expiry;
      try {
        expiry = expiryTimestamp.toDate ? expiryTimestamp.toDate().getTime() : new Date(expiryTimestamp).getTime();
      } catch (e) { return null; }
      const diff = expiry - now;
      if (diff <= 0) return <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded">EXPIRED</span>;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) return <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1"><Clock size={10}/> {days}d left</span>;
      return <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 animate-pulse"><Clock size={10}/> {hours}h left</span>;
  };

  // 3. INITIAL DATA LOAD (CRASH FIX INCLUDED)
  useEffect(() => {
    const initData = async () => {
      try {
        const authUser = await getCurrentUser();
        
        if (authUser) {
            const userRef = doc(db, "users", authUser.uid);
            const userSnap = await getDoc(userRef);
            
            // Fix: Define userData here
            let userData = { ...authUser }; 

            if (userSnap.exists()) {
                userData = { ...authUser, ...userSnap.data() };
            }
            
            setUser(userData); 
            
            const allTasks = await getActiveTasks(authUser.uid);
            setTasks(allTasks);

            // Fix: Check userData, not user
            // if (!userData.hasSeenMainTutorial && allTasks.length > 0) {
            //    setRunTutorial(true);
            // }
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    initData();
  }, []);

  // 4. TUTORIAL STEP LOGIC
  const handleTutorialStepChange = async (nextIndex) => {
      setRunTutorial(false);
      
      if (nextIndex === 3 && !selectedTask && tasks.length > 0) {
          const targetTask = tasks.find(t => t.tags?.includes('tutorial')) || tasks[0];
          if(targetTask) { setSelectedTask(targetTask); setModalStep(1); }
      }
      if (nextIndex === 4) setModalStep(2);
      if (nextIndex === 7) setModalStep(3);

      if (nextIndex === 8) {
          setSelectedTask(null);
          localStorage.setItem('kasi_tour_progress', 'profile_pending'); 
          
          if(user?.uid) {
              try {
                  const userRef = doc(db, "users", user.uid);
                  await updateDoc(userRef, { hasSeenMainTutorial: true });
              } catch(e) { console.error("Error saving tutorial status", e); }
          }
      }

      await new Promise(r => setTimeout(r, 800));
      setTutorialStepIndex(nextIndex);
      setRunTutorial(true);
  };
  const handleTutorialComplete = () => setRunTutorial(false);

  // --- ACTIONS ---
  const handleUserUpdate = (updates) => {
      setUser(prev => ({ ...prev, ...updates }));
  };

  const openTask = (task) => { 
      setSelectedTask(task); 
      setModalStep(1); 
      setLinkClicked(false); 
      setProofInput(""); 
      setProofFileKey(null); 

      if (runTutorial && tutorialStepIndex === 2) {
          handleTutorialStepChange(3);
      }
  };

  const handleLinkClick = () => { window.open(selectedTask.link, "_blank"); setLinkClicked(true); };
  const openPartnerWall = (partnerName) => { alert(`Opening ${partnerName}...`); };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const res = await fetch('/api/r2', { method: 'POST', body: JSON.stringify({ filename: file.name, fileType: file.type, folder: 'proofs' }) });
      const { uploadUrl, fileKey } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setProofFileKey(fileKey);
    } catch (err) { alert("Upload failed"); } finally { setIsUploadingFile(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(runTutorial) {
        alert("For tutorial, please click the 'Next' button on the tooltip, or click the Profile icon below!");
        return;
    }
    const finalProof = proofFileKey || proofInput;
    if (!finalProof) return alert("Please provide proof!");
    
    setIsSubmitting(true);
    const result = await submitTaskProof(user.uid, selectedTask.id, selectedTask.title, selectedTask.reward, finalProof, selectedTask.readableId);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    } else { alert("Error: " + result.error); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 relative font-sans">
      
      <AppTutorial 
        run={runTutorial} 
        steps={tutorialSteps} 
        stepIndex={tutorialStepIndex}
        onStepChange={handleTutorialStepChange}
        onComplete={handleTutorialComplete}
      />

      <button onClick={() => { setRunTutorial(true); setTutorialStepIndex(0); }} className="fixed bottom-24 right-4 z-40 bg-white p-3 rounded-full shadow-lg text-kasi-dark hover:scale-110 transition active:scale-95"><HelpCircle size={24} /></button>

      {/* HEADER */}
      <div className="bg-kasi-dark pt-8 pb-10 px-6 rounded-b-[2.5rem] shadow-lg">
        <h1 className="text-white text-2xl font-black">Earn Cash</h1>
        <p className="text-kasi-subtle text-sm">Select your earning method below.</p>
      </div>

      <div className="px-5 -mt-6 space-y-6">
        
        {/* --- STREAK BOARD --- */}
        <div className="tutorial-streak">
             {!loading && <StreakBoard user={user} onUpdate={handleUserUpdate} />}
             {loading && <div className="h-40 bg-white rounded-3xl animate-pulse"></div>}
        </div>

        {/* TABS */}
        <div className="flex bg-white p-1 rounded-2xl shadow-lg border border-white/50 relative z-10">
            <button onClick={() => setActiveTab("inhouse")} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "inhouse" ? "bg-kasi-gold text-kasi-dark shadow-md" : "text-gray-400 hover:bg-gray-50"}`}><Zap size={16} /> In-House</button>
            <button onClick={() => setActiveTab("partners")} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "partners" ? "bg-kasi-gold text-kasi-dark shadow-md" : "text-gray-400 hover:bg-gray-50"}`}><Globe size={16} /> Partners</button>
        </div>

        {/* IN-HOUSE CONTENT */}
        {activeTab === "inhouse" && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
                {tasks.map((task, index) => (
                    <div 
                        key={task.id} 
                        onClick={() => openTask(task)} 
                        className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform relative overflow-hidden group ${index === 0 ? 'tutorial-first-task' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 shrink-0">
                                    {getTaskIcon(task)}
                                </div>
                                <div>
                                    <h3 className="text-kasi-dark font-bold text-sm line-clamp-1">{task.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {task.platform && task.platform !== 'none' && (
                                            <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                                {task.platform}
                                            </span>
                                        )}
                                        {getTimeLeftBadge(task.expiryDate)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right"><span className="block text-xl font-bold text-kasi-gold">+RM{task.reward}</span></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* PARTNERS CONTENT */}
        {activeTab === "partners" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                {['Torox', 'BitLabs', 'AdGem', 'CPX'].map((partner) => (
                    <div key={partner} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-kasi-gold transition group cursor-pointer relative overflow-hidden" onClick={() => openPartnerWall(partner)}>
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {partner === 'Torox' ? <Gamepad2 className="text-red-500" size={28}/> : partner === 'BitLabs' ? <Globe className="text-blue-500" size={28}/> : partner === 'AdGem' ? <Gift className="text-purple-600" size={28}/> : <Star className="text-yellow-600" size={28}/>}
                        </div>
                        <h3 className="font-black text-kasi-dark text-sm">{partner}</h3>
                        <button className="w-full bg-kasi-dark text-white text-xs font-bold py-2 rounded-lg shadow-md active:scale-95 mt-2">Open Wall</button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- WIZARD MODAL (ORIGINAL LAYOUT + Z-INDEX FIX) --- */}
      {selectedTask && (
        // FIX: z-[9999] makes it sit ON TOP of the navbar
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !runTutorial && setSelectedTask(null)}></div>
            
            {/* Original Layout: max-h-[90vh], normal overflow */}
            <div className="bg-white w-full max-w-md rounded-3xl p-6 relative z-10 animate-slide-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div className="flex gap-1">
                        {[1,2,3].map(s => <div key={s} className={`h-1 w-8 rounded-full ${modalStep >= s ? "bg-kasi-gold" : "bg-gray-200"}`}></div>)}
                    </div>
                    <button onClick={() => setSelectedTask(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                    {/* STEP 1: OVERVIEW */}
                    {modalStep === 1 && (
                        <div className="animate-fade-in pb-2">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-kasi-dark">{selectedTask.title}</h2>
                                <span className="text-2xl font-black text-kasi-gold block mt-2">RM {selectedTask.reward}</span>
                            </div>
                            {selectedTask.description && (
                                <div className="text-center mb-6 px-4">
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{selectedTask.description}</p>
                                </div>
                            )}
                            <button onClick={() => setModalStep(2)} className="tutorial-accept-btn w-full bg-kasi-gold text-kasi-dark font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">Accept Challenge <ArrowRight size={20}/></button>
                        </div>
                    )}
                    
                    {/* STEP 2: INSTRUCTIONS */}
                    {modalStep === 2 && (
                        <div className="animate-fade-in pb-2">
                            <h3 className="text-xl font-black text-kasi-dark mb-4">Instructions</h3>
                            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                                <p className="task-instruction-text text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedTask.instructions || selectedTask.description || "No specific instructions provided."}
                                </p>
                            </div>
                            <button onClick={handleLinkClick} className={`tutorial-link-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 ${linkClicked ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-blue-100 text-blue-600"}`}>{linkClicked ? <><CheckCircle size={18}/> Link Opened</> : <><ExternalLink size={18}/> Go to Task Link</>}</button>
                            <button onClick={() => setModalStep(3)} disabled={!linkClicked && !runTutorial} className={`tutorial-next-step-btn w-full py-4 mt-3 rounded-xl font-black transition ${linkClicked ? "bg-kasi-gold text-kasi-dark shadow-lg active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>Next Step</button>
                        </div>
                    )}

                    {/* STEP 3: PROOF */}
                    {modalStep === 3 && (
                        <div className="animate-fade-in pb-2 tutorial-proof-area">
                            <h3 className="text-xl font-black text-kasi-dark mb-1">Submit Proof</h3>
                            <p className="text-xs text-gray-400 mb-4">Upload a screenshot OR paste your username/code.</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${proofFileKey ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-kasi-gold"}`}>
                                    {isUploadingFile ? (
                                        <div className="flex flex-col items-center py-4 text-kasi-gold"><Loader2 className="animate-spin mb-2" /><span className="text-xs font-bold">Uploading...</span></div>
                                    ) : proofFileKey ? (
                                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-green-700"><div className="bg-green-100 p-2 rounded-full"><ImageIcon size={18}/></div><div className="text-left"><p className="text-xs font-bold">Screenshot Uploaded!</p></div></div><button type="button" onClick={() => setProofFileKey(null)} className="p-2 hover:bg-red-100 text-red-500 rounded-full transition"><Trash2 size={18} /></button></div>
                                    ) : (
                                        <label className="cursor-pointer block py-4"><input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} /><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400"><Camera size={24} /></div><p className="text-sm font-bold text-gray-600">Tap to Upload Screenshot</p></label>
                                    )}
                                </div>
                                <div className="flex items-center gap-3"><div className="h-px bg-gray-200 flex-1"></div><span className="text-[10px] font-bold text-gray-400 uppercase">OR TEXT</span><div className="h-px bg-gray-200 flex-1"></div></div>
                                <textarea value={proofInput} onChange={(e) => setProofInput(e.target.value)} disabled={!!proofFileKey} placeholder="Type proof details..." className={`w-full border-2 rounded-xl p-4 text-sm outline-none h-24 resize-none transition ${proofFileKey ? "bg-gray-100 text-gray-400 border-gray-100" : "bg-white border-gray-200 focus:border-kasi-gold"}`}/>
                                <button type="submit" disabled={isSubmitting || (!proofInput && !proofFileKey) || isUploadingFile} className="w-full bg-kasi-dark text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-70">{isSubmitting ? "Verifying..." : "Submit Task"}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// 3. MAIN EXPORT WRAPPED IN SUSPENSE
export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kasi-gray flex items-center justify-center">Loading Tasks...</div>}>
      <TasksContent />
    </Suspense>
  );
}