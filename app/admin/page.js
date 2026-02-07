"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { Users, CheckCircle, Clock, Network, Link as LinkIcon, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { backfillReferralCodes, manualLinkUser } from "../../lib/referralUtils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pending: 0, activeTasks: 0 });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({ email: "", code: "" });

  useEffect(() => {
    async function loadStats() {
      const usersSnap = await getCountFromServer(collection(db, "users"));
      const pendingQ = query(collection(db, "submissions"), where("status", "==", "pending"));
      const pendingSnap = await getCountFromServer(pendingQ);
      const tasksQ = query(collection(db, "tasks"), where("isActive", "==", true));
      const tasksSnap = await getCountFromServer(tasksQ);

      setStats({
        users: usersSnap.data().count,
        pending: pendingSnap.data().count,
        activeTasks: tasksSnap.data().count
      });
    }
    loadStats();
  }, []);

  const handleBackfill = async () => {
      if(!confirm("Scan all users and generate codes for those missing them?")) return;
      const count = await backfillReferralCodes();
      alert(`Done! Updated ${count} users.`);
  };

  const handleManualLink = async (e) => {
      e.preventDefault();
      const res = await manualLinkUser(linkData.email, linkData.code);
      if(res.success) { alert("Linked successfully!"); setShowLinkModal(false); setLinkData({email:"", code:""}); }
      else alert("Error: " + res.error);
  };

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin.</p>
        </div>
        <div className="text-right">
             <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
             <span className="text-sm font-bold text-green-600">System Live</span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Clock/>} label="Pending Reviews" value={stats.pending} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={<Users/>} label="Total Users" value={stats.users} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<CheckCircle/>} label="Active Tasks" value={stats.activeTasks} color="bg-green-50 text-green-600" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/tasks" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-red-200 transition group">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">Manage Tasks &rarr;</h3>
            <p className="text-gray-400 text-sm">Add new in-house tasks, edit rewards, or pause campaigns.</p>
        </Link>
        <Link href="/admin/reviews" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-red-200 transition group relative overflow-hidden">
            {stats.pending > 0 && <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">{stats.pending} New</div>}
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">Review Proofs &rarr;</h3>
            <p className="text-gray-400 text-sm">Approve or reject user submissions. Payouts are automatic on approval.</p>
        </Link>
      </div>

      {/* REFERRAL SYSTEM MANAGEMENT */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Network size={24} className="text-purple-600"/> Referral System</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={handleBackfill} className="p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl text-left transition group border border-gray-100">
                  <RefreshCcw size={20} className="text-gray-400 group-hover:text-purple-600 mb-2"/>
                  <h4 className="font-bold text-sm text-gray-800">Backfill Codes</h4>
                  <p className="text-xs text-gray-400 mt-1">Generate codes for old users.</p>
              </button>

              <button onClick={() => setShowLinkModal(true)} className="p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl text-left transition group border border-gray-100">
                  <LinkIcon size={20} className="text-gray-400 group-hover:text-purple-600 mb-2"/>
                  <h4 className="font-bold text-sm text-gray-800">Manual Link</h4>
                  <p className="text-xs text-gray-400 mt-1">Fix user hierarchy manually.</p>
              </button>

              <Link href="/admin/tree" className="p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl text-left transition group border border-gray-100 block">
                  <Network size={20} className="text-gray-400 group-hover:text-purple-600 mb-2"/>
                  <h4 className="font-bold text-sm text-gray-800">View Tree</h4>
                  <p className="text-xs text-gray-400 mt-1">Visualize the referral pyramid.</p>
              </Link>
          </div>
      </div>

      {/* MANUAL LINK MODAL */}
      {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-scale-up">
                  <h3 className="font-bold text-lg mb-4">Link User Manually</h3>
                  <p className="text-xs text-gray-400 mb-4">Move a user under a specific upline leader.</p>
                  <form onSubmit={handleManualLink} className="space-y-3">
                      <input required placeholder="Child Email (User to move)" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-500 text-sm" value={linkData.email} onChange={e => setLinkData({...linkData, email: e.target.value})} />
                      <input required placeholder="Parent Referral Code (Leader)" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-500 text-sm" value={linkData.code} onChange={e => setLinkData({...linkData, code: e.target.value})} />
                      <div className="flex gap-2 mt-4 pt-2">
                          <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl">Cancel</button>
                          <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">Link User</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}