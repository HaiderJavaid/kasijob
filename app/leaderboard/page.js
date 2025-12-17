"use client";
import { useState, useEffect } from "react";
import { getLeaderboard } from "../../lib/gamification"; // Using the logic we made
import { Crown, Trophy, Medal } from "lucide-react";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getLeaderboard();
      setLeaders(data);
      setLoading(false);
    }
    load();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} className="text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal size={24} className="text-orange-500 fill-orange-500" />;
    return <span className="font-black text-gray-400 text-lg">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 relative font-sans">
      
      {/* Header */}
      <div className="bg-kasi-dark pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg text-center">
        <h1 className="text-white text-2xl font-black mb-1">Top Earners</h1>
        <p className="text-kasi-subtle text-xs">Who is making the most bank?</p>
      </div>

      <div className="px-5 -mt-10 space-y-3">
        {loading ? (
            <p className="text-center text-gray-400 mt-10">Loading ranks...</p>
        ) : (
            leaders.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl shadow-sm border border-gray-100 ${index === 0 ? "bg-yellow-50 border-yellow-200 scale-105" : "bg-white"}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 text-center flex justify-center">
                            {getRankIcon(index + 1)}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <h3 className={`font-bold text-sm ${index === 0 ? "text-yellow-800" : "text-kasi-dark"}`}>
                                {user.name || "Anonymous"}
                            </h3>
                        </div>
                    </div>
                    <div className="font-black text-kasi-gold">
                        RM {user.balance?.toFixed(2)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}