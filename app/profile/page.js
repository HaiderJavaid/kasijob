"use client";
// 1. Force dynamic rendering
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  LogOut, Wallet, CreditCard, X, CheckCircle, Info, ShieldCheck, Briefcase, Clock
} from "lucide-react"; 
import AvatarUpload from '@/components/AvatarUpload';
import AppTutorial from "../../components/AppTutorial"; 

import { getWalletStats, saveBankDetails } from "../../lib/billing"; 
import { getUserSubmissions } from "../../lib/tasks"; 

// 2. We move the main logic into a sub-component called "ProfileContent"
function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // DATA STATE
  const [tasks, setTasks] = useState([]);
  const [updatesCount, setUpdatesCount] = useState(0); 
  
  // WALLET STATE
  const [payableAmount, setPayableAmount] = useState(0);
  const [holdAmount, setHoldAmount] = useState(0);
  
  // UI STATE
  const [activeTab, setActiveTab] = useState("tasks"); 
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({ 
    bankName: "Maybank", 
    accountNumber: "", 
    holderName: "" 
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  // TUTORIAL STATE
  const [runProfileTour, setRunProfileTour] = useState(false);

  const profileSteps = [
    {
        target: '.tutorial-balance',
        content: 'This is your wallet. We automatically pay you on the 5th of every month!',
        disableBeacon: true,
        placement: 'bottom',
    },
    {
        target: '.tutorial-bank',
        content: 'Important: Click here to add your Bank or TNG details so you can receive money.',
        placement: 'bottom',
    },
    {
        target: '.nav-item-leaderboard', 
        content: 'Almost done! Click the Leaderboard to see how to earn a 100% Bonus.',
        placement: 'top',
        hideFooter: true, 
        spotlightClicks: true,
    }
  ];

  const handleProfileStepChange = (index) => {
      if (index === 2) {
          localStorage.setItem('kasi_tour_progress', 'leaderboard_pending');
      }
  };

  const handleTourFinish = () => {
      setRunProfileTour(false);
  };

  useEffect(() => {
     if (searchParams.get('tour') === 'true') {
         setTimeout(() => setRunProfileTour(true), 1000);
     }
     
     const progress = localStorage.getItem('kasi_tour_progress');
     
     if (progress === 'profile_pending') {
         setTimeout(() => setRunProfileTour(true), 1000);
         localStorage.removeItem('kasi_tour_progress'); 
     }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login"); 
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser(userData);
          if (userData.bankDetails) setBankDetails(userData.bankDetails);

          // Get Wallet Stats
          const currentBalance = userData.balance || 0;
          const stats = await getWalletStats(currentUser.uid, currentBalance);
          setPayableAmount(stats.payable);
          setHoldAmount(stats.hold);

          // Get Task History
          const tHistory = await getUserSubmissions(currentUser.uid);
          setTasks(tHistory);

          // Calculate Updates
          const newUpdates = tHistory.filter(t => t.status === 'approved' || t.status === 'rejected').length;
          setUpdatesCount(newUpdates);

        } else {
          setUser({ email: currentUser.email, name: "User", uid: currentUser.uid, balance: 0 });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
        await saveBankDetails(user.uid, bankDetails);
        alert("Payment details updated successfully!");
        setShowBankModal(false);
        setUser(prev => ({ ...prev, bankDetails }));
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        setIsSavingBank(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-kasi-gray flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-kasi-gray text-gray-900 pb-24 font-sans">
       <AppTutorial run={runProfileTour} steps={profileSteps} onComplete={handleTourFinish} onStepChange={handleProfileStepChange} />
      
      {/* HEADER */}
      <div className="bg-white px-6 py-6 sticky top-0 z-20 shadow-sm mb-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-2xl font-black text-kasi-dark">Profile</h1>
          <button onClick={() => auth.signOut()} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-500 transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        
        {/* USER INFO */}
        <div className="flex items-center space-x-4">
          <AvatarUpload 
            user={user} 
            onUpdate={(updates) => setUser({ ...user, ...updates })} 
          />
          <div>
            <h2 className="text-xl font-bold text-kasi-dark">
                {user?.name || user?.email?.split('@')[0] || "Anonymous"}
            </h2>
            <p className="text-kasi-subtle text-sm">{user?.email}</p>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-kasi-dark text-white p-6 rounded-3xl shadow-lg relative overflow-hidden tutorial-balance">
            {/* HISTORY BUTTON */}
            <button 
                onClick={() => router.push('/wallet/history')} 
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition z-10"
            >
                <Clock size={18} />
            </button>

            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Wallet size={80} /></div>
            
            <p className="text-gray-400 text-xs font-bold uppercase">Total Earnings</p>
            <p className="text-4xl font-black mt-2 text-kasi-gold">RM {user?.balance?.toFixed(2) || "0.00"}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Payable (5th)</p>
                    <p className="text-xl font-bold text-white">RM {payableAmount.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">On Hold <Info size={10}/></p>
                    <p className="text-xl font-bold text-white opacity-80">RM {holdAmount.toFixed(2)}</p>
                </div>
            </div>

            <button 
                onClick={() => setShowBankModal(true)}
                className={`mt-4 w-full py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold text-sm tutorial-bank ${
                    user.bankDetails ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-kasi-dark hover:bg-gray-200"
                }`}
            >
                {user.bankDetails ? (
                    <><CheckCircle size={16} className="text-green-400"/> {user.bankDetails.bankName} Linked</>
                ) : (
                    <><CreditCard size={16}/> Add Bank / TNG</>
                )}
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-3">*Earnings after the 25th are held until next month.</p>
        </div>

        {/* ADMIN BUTTON */}
        {user?.role === 'admin' && (
            <button 
                onClick={() => router.push('/admin')}
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 mt-4 flex items-center justify-center gap-2 hover:bg-red-700 transition"
            >
                <ShieldCheck size={20} /> Access Admin Dashboard
            </button>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {['tasks', 'jobs'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                        activeTab === tab 
                        ? "bg-kasi-gold text-kasi-dark shadow-sm" 
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                >
                    {tab} History
                    {tab === 'tasks' && updatesCount > 0 && (
                       <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                    )}
                </button>
            ))}
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[200px]">
            {activeTab === 'tasks' && (
                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">No tasks completed yet.</p>
                    ) : (
                        tasks.map((task, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-kasi-dark line-clamp-1">{task.taskTitle}</p>
                                    <p className="text-xs text-gray-400">Proof: {task.proof?.includes('proofs/') ? 'Image' : 'Text'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-kasi-gold">+ RM {task.reward?.toFixed(2)}</p>
                                    <div className="flex justify-end mt-1">
                                        {task.status === 'pending' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">Reviewing</span>}
                                        {task.status === 'approved' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Approved</span>}
                                        {task.status === 'rejected' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Rejected</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'jobs' && (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Briefcase size={32} className="mx-auto text-gray-300 mb-2"/>
                    <h3 className="font-bold text-gray-400">No Jobs Yet</h3>
                    <p className="text-xs text-gray-400 max-w-[200px] mx-auto mt-1">Applied jobs will appear here.</p>
                </div>
            )}
        </div>
      </div>

      {/* BANK DETAILS MODAL */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBankModal(false)}></div>
            <div className="bg-white w-full max-w-md m-4 rounded-3xl p-6 relative z-10 animate-slide-up">
                <button onClick={() => setShowBankModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20} className="text-kasi-dark"/></button>
                <h2 className="text-2xl font-black text-kasi-dark mb-1">Payment Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Enter where you want to receive your monthly earnings.</p>
                
                <form onSubmit={handleSaveBank} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Bank / E-Wallet</label>
                        <select 
                            value={bankDetails.bankName} 
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-kasi-dark outline-none focus:border-kasi-gold"
                        >
                            <option value="Maybank">Maybank</option>
                            <option value="CIMB">CIMB Bank</option>
                            <option value="Public Bank">Public Bank</option>
                            <option value="TNG">Touch 'n Go E-Wallet</option>
                            <option value="Hong Leong">Hong Leong Bank</option>
                            <option value="RHB">RHB Bank</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Account Number / Phone</label>
                        <input required type="text" placeholder="e.g. 1122334455" value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-kasi-dark outline-none focus:border-kasi-gold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Account Holder Name</label>
                        <input required type="text" placeholder="Must match your KasiJobs name" value={bankDetails.holderName} onChange={(e) => setBankDetails({...bankDetails, holderName: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-kasi-dark outline-none focus:border-kasi-gold" />
                    </div>
                    <button type="submit" disabled={isSavingBank} className="w-full bg-kasi-dark text-white font-bold py-4 rounded-xl shadow-lg mt-2 disabled:opacity-70 hover:bg-gray-800 transition">{isSavingBank ? "Saving..." : "Save Payment Details"}</button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">Next Auto-Payout: <b>5th of Next Month</b></p>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

// 3. MAIN EXPORT WRAPPED IN SUSPENSE
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kasi-gray flex items-center justify-center">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}