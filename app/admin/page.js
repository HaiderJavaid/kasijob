"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    pending: 0,
    activeTasks: 0
  });

  useEffect(() => {
    async function loadStats() {
      // 1. Count Users
      const usersSnap = await getCountFromServer(collection(db, "users"));
      
      // 2. Count Pending Submissions
      const pendingQ = query(collection(db, "submissions"), where("status", "==", "pending"));
      const pendingSnap = await getCountFromServer(pendingQ);

      // 3. Count Active Tasks
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

  return (
    <div className="space-y-8">
      
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
