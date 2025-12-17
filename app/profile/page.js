"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  LogOut, Wallet, CreditCard, X, 
  History, Building2, CheckCircle, Clock, XCircle, Briefcase 
} from "lucide-react"; 

// IMPORT HELPERS
import { requestWithdrawal, getWithdrawalHistory } from "../../lib/billing"; 
import { getUserSubmissions } from "../../lib/tasks"; // <--- NEW IMPORT

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // DATA STATE
  const [withdrawals, setWithdrawals] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // UI STATE
  const [activeTab, setActiveTab] = useState("wallet"); // 'wallet', 'tasks', 'jobs'
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [withdrawMethod, setWithdrawMethod] = useState("TNG");
  const [bankDetails, setBankDetails] = useState({ name: "", account: "", bankName: "Maybank" });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login"); 
        return;
      }
      try {
        // 1. Get User Data
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data());
          
          // 2. Get Withdrawals
          const wHistory = await getWithdrawalHistory(currentUser.uid);
          setWithdrawals(wHistory);

          // 3. Get Task History
          const tHistory = await getUserSubmissions(currentUser.uid);
          setTasks(tHistory);

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

  // --- WITHDRAWAL LOGIC ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const result = await requestWithdrawal(
        user.uid, 
        withdrawAmount, 
        withdrawMethod, 
        {
            accountName: bankDetails.name,
            accountNumber: bankDetails.account,
            bankName: withdrawMethod === "BANK" ? bankDetails.bankName : "Touch 'n Go"
        }
    );

    if (result.success) {
        alert("Withdrawal requested!");
        setShowWithdraw(false);
        setUser(prev => ({ ...prev, balance: prev.balance - withdrawAmount }));
        window.location.reload(); 
    } else {
        alert("Failed: " + result.error);
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="min-h-screen bg-kasi-gray flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-kasi-gray text-gray-900 pb-24 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="bg-white px-6 py-6 sticky top-0 z-20 shadow-sm mb-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-2xl font-black text-kasi-dark">Profile</h1>
          <button onClick={() => auth.signOut()} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-500 transition">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        
        {/* 2. USER INFO */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-kasi-gold/10 flex items-center justify-center text-2xl font-bold text-kasi-gold border-2 border-kasi-gold">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-kasi-dark">{user?.name || "Anonymous"}</h2>
            <p className="text-kasi-subtle text-sm">{user?.email}</p>
          </div>
        </div>

        {/* 3. BALANCE CARD (Always Visible) */}
        <div className="bg-kasi-dark text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} /></div>
            <p className="text-gray-400 text-xs font-bold uppercase">Current Balance</p>
            <p className="text-4xl font-black mt-2 text-kasi-gold">RM {user?.balance?.toFixed(2) || "0.00"}</p>
            
            <button 
                onClick={() => setShowWithdraw(true)}
                className="mt-6 w-full bg-white text-kasi-dark font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
                <CreditCard size={18}/> Withdraw Funds
            </button>
        </div>

        {/* 4. TABS NAVIGATION */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {['wallet', 'tasks', 'jobs'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                        activeTab === tab 
                        ? "bg-kasi-gold text-kasi-dark shadow-sm" 
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                >
                    {tab === 'wallet' ? 'Withdrawals' : tab}
                </button>
            ))}
        </div>

        {/* 5. TAB CONTENT */}
        <div className="min-h-[200px]">
            
            {/* TAB: WALLET HISTORY */}
            {activeTab === 'wallet' && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction History</h3>
                    {withdrawals.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">No withdrawals yet.</p>
                    ) : (
                        withdrawals.map((tx, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-kasi-dark">
                                        {tx.method === 'TNG' ? "Touch 'n Go" : tx.details.bankName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(tx.requestedAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-kasi-dark">- RM {tx.amount}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {tx.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: TASK HISTORY */}
            {activeTab === 'tasks' && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Task Submissions</h3>
                    {tasks.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">No tasks completed yet.</p>
                    ) : (
                        tasks.map((task, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-kasi-dark line-clamp-1">{task.taskTitle}</p>
                                    <p className="text-xs text-gray-400">Proof: {task.proof?.substring(0, 15)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-kasi-gold">+ RM {task.reward?.toFixed(2)}</p>
                                    <div className="flex justify-end mt-1">
                                        {task.status === 'pending' && <Clock size={14} className="text-yellow-500"/>}
                                        {task.status === 'approved' && <CheckCircle size={14} className="text-green-500"/>}
                                        {task.status === 'rejected' && <XCircle size={14} className="text-red-500"/>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: JOB HISTORY (Future) */}
            {activeTab === 'jobs' && (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Briefcase size={32} className="mx-auto text-gray-300 mb-2"/>
                    <h3 className="font-bold text-gray-400">Coming Soon</h3>
                    <p className="text-xs text-gray-400 max-w-[200px] mx-auto mt-1">
                        You will soon be able to apply for full-time & part-time jobs here.
                    </p>
                </div>
            )}

        </div>
      </div>

      {/* WITHDRAWAL MODAL (Same as before) */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdraw(false)}></div>
            <div className="bg-white w-full max-w-md m-4 rounded-3xl p-6 relative z-10 animate-slide-up">
                <button onClick={() => setShowWithdraw(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20} className="text-kasi-dark"/></button>
                <h2 className="text-2xl font-black text-kasi-dark mb-1">Withdraw Money</h2>
                <p className="text-sm text-gray-500 mb-6">Minimum withdrawal is RM 50.00</p>
                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Amount (RM)</label>
                        <input type="number" min="50" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-lg font-bold text-kasi-dark outline-none focus:border-kasi-gold" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setWithdrawMethod("TNG")} className={`p-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-2 ${withdrawMethod === "TNG" ? "border-kasi-gold bg-yellow-50 text-kasi-dark" : "border-gray-200 text-gray-400"}`}><Wallet size={24}/> Touch 'n Go</button>
                        <button type="button" onClick={() => setWithdrawMethod("BANK")} className={`p-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-2 ${withdrawMethod === "BANK" ? "border-kasi-gold bg-yellow-50 text-kasi-dark" : "border-gray-200 text-gray-400"}`}><Building2 size={24}/> Bank Transfer</button>
                    </div>
                    <div className="space-y-3 pt-2">
                        <input required placeholder="Full Name" value={bankDetails.name} onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-kasi-gold" />
                        <input required placeholder={withdrawMethod === "TNG" ? "Phone Number" : "Account Number"} value={bankDetails.account} onChange={(e) => setBankDetails({...bankDetails, account: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-kasi-gold" />
                    </div>
                    <button type="submit" disabled={isProcessing} className="w-full bg-kasi-dark text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-70 hover:bg-gray-800 transition">{isProcessing ? "Processing..." : "Confirm Withdrawal"}</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}