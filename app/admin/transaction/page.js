"use client";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, query, orderBy, limit, getDocs, startAfter, where } from "firebase/firestore";
import { ArrowLeft, ArrowRight, DollarSign, Calendar, Filter, Zap, Users, ShieldAlert, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // FILTER STATE
    const [filterSource, setFilterSource] = useState("all");

    const fetchTransactions = async (isNext = false, source = "all") => {
        setLoading(true);
        try {
            let constraints = [orderBy("createdAt", "desc"), limit(20)];
            
            // Apply Source Filter
            if (source !== "all") {
                constraints.unshift(where("source", "==", source));
            }

            if (isNext && lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            const q = query(collection(db, "transactions"), ...constraints);
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (isNext) {
                setTransactions(prev => [...prev, ...data]);
            } else {
                setTransactions(data);
            }
            
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filter changes
    useEffect(() => { 
        setTransactions([]); 
        setLastDoc(null);
        fetchTransactions(false, filterSource); 
    }, [filterSource]);

    // --- HELPER: GROUP BY DATE ---
    const groupedTransactions = transactions.reduce((groups, trans) => {
        const dateKey = trans.dateString || "Unknown Date"; 
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(trans);
        return groups;
    }, {});

    // --- HELPER: FORMAT DATE HEADER ---
    const formatDateHeader = (dateString) => {
        if (dateString === "Unknown Date") return dateString;
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); // e.g. 14 Feb 2024
    };

    const getIcon = (source) => {
        switch(source) {
            case 'task_reward': return <Zap size={20} />;
            case 'referral_reward': 
            case 'leader_bonus': return <Users size={20} />;
            case 'daily_streak': return <Calendar size={20} />;
            case 'system_adjustment': return <CheckCircle size={20} />;
            default: return <ShieldAlert size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-2 hover:text-black transition font-bold text-sm">
                        <ArrowLeft size={18}/> Back
                    </button>
                    <h1 className="text-2xl font-black text-gray-900">Financial Ledger 📒</h1>
                    <p className="text-sm text-gray-500">Track every cent earned by users.</p>
                </div>
                
                {/* CATEGORY FILTER */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <Filter size={16} className="text-gray-400 ml-2"/>
                    <select 
                        value={filterSource} 
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 p-2 outline-none cursor-pointer"
                    >
                        <option value="all">All Sources</option>
                        <option value="task_reward">Tasks</option>
                        <option value="referral_reward">Referrals</option>
                        <option value="daily_streak">Daily Streak</option>
                        <option value="system_adjustment">Adjustments</option>
                    </select>
                </div>
            </div>

            {/* List Grouped by Date */}
            <div className="space-y-8 pb-20">
                {Object.keys(groupedTransactions).map(dateKey => (
                    <div key={dateKey} className="animate-fade-in">
                        {/* DATE HEADER */}
                        <div className="flex items-center gap-3 mb-3 ml-1">
                            <div className="h-px bg-gray-300 w-8"></div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{formatDateHeader(dateKey)}</h3>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* TRANSACTIONS FOR THIS DATE */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {groupedTransactions[dateKey].map((t) => (
                                <div key={t.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                            {getIcon(t.source)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{t.userName || "Unknown User"}</p>
                                            <p className="text-xs text-gray-400 line-clamp-1">{t.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${t.type === 'credit' ? "text-green-600" : "text-gray-900"}`}>
                                            {t.type === 'credit' ? "+" : "-"} RM {t.amount?.toFixed(2)}
                                        </p>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">
                                            {new Date(t.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {transactions.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
                        No transactions found.
                    </div>
                )}
                
                {loading && <div className="text-center py-10 text-gray-400">Loading records...</div>}
            </div>

            {/* Load More */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center z-20">
                 <button 
                    onClick={() => fetchTransactions(true, filterSource)} 
                    disabled={loading || !lastDoc}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                    Load More <ArrowRight size={16}/>
                </button>
            </div>
        </div>
    );
}