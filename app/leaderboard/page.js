"use client";
// 1. Force dynamic rendering
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "../../lib/auth"; 
import { getLeaderboard } from "../../lib/gamification"; 
import { stringToColor, getInitials } from "../../lib/utils"; 
import { Crown, Loader2, Trophy } from "lucide-react"; // Added Trophy for fallback
import AppTutorial from "../../components/AppTutorial"; 
import { db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// --- SMART SAFE AVATAR ---
const SafeAvatar = ({ user, className }) => {
    const [displayUrl, setDisplayUrl] = useState(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchFreshUrl = async () => {
            if (user?.avatarKey) {
                try {
                    const res = await fetch(`/api/r2?key=${user.avatarKey}`);
                    const data = await res.json();
                    if (data.viewUrl && isMounted) {
                        setDisplayUrl(data.viewUrl);
                        return;
                    }
                } catch (e) {
                    console.error("Avatar fetch error:", e);
                }
            }
            if (user?.photoURL && isMounted) {
                setDisplayUrl(user.photoURL);
            }
        };
        fetchFreshUrl();
        return () => { isMounted = false; };
    }, [user]);

    if (!displayUrl || imgError) {
        return (
            <div 
                className={`${className} flex items-center justify-center font-bold text-white shadow-inner shrink-0 overflow-hidden`} 
                style={{ backgroundColor: stringToColor(user?.name || "User") }}
            >
                {getInitials(user?.name || "User")}
            </div>
        );
    }
    return (
        <img 
            src={displayUrl} 
            alt={user?.name || "User"} 
            className={`${className} object-cover shrink-0 bg-gray-200`} 
            onError={() => setImgError(true)} 
        />
    );
};

// --- CONTENT COMPONENT (Logic moved here) ---
function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState(null);
  const [leaders, setLeaders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [runRankTour, setRunRankTour] = useState(false);

  const rankSteps = [
    {
        target: '.tutorial-top3',
        content: 'Top 3 earners every month get a 100% Bonus on their earnings!',
        disableBeacon: true,
        placement: 'bottom',
    },
    {
        target: 'body',
        placement: 'center',
        content: 'That\'s it! You are ready to earn. Good luck! 🚀',
    }
  ];

  useEffect(() => {
     const init = async () => {
         const authUser = await getCurrentUser();
         
         if (authUser) {
             try {
                const docRef = doc(db, "users", authUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser({ uid: authUser.uid, ...docSnap.data() });
                } else {
                    setUser(authUser);
                }
             } catch (e) {
                 console.error("Error fetching user stats:", e);
                 setUser(authUser);
             }
         }

         const data = await getLeaderboard();
         setLeaders(data);
         setLoading(false);

         if (searchParams.get('tour') === 'true') setRunRankTour(true);
         
         const progress = localStorage.getItem('kasi_tour_progress');
         if (progress === 'leaderboard_pending') {
             setRunRankTour(true);
             localStorage.removeItem('kasi_tour_progress'); 
         }
     };
     init();
  }, [searchParams]);

  const handleTourFinish = () => {
      if (user) localStorage.setItem(`kasi_tutorial_seen_${user.uid}`, "true");
      setRunRankTour(false);
      router.push('/tasks'); 
  };

  const myRankIndex = leaders.findIndex(l => String(l.id) === String(user?.uid));
  const myRankDisplay = myRankIndex !== -1 ? myRankIndex + 1 : "99+";

  if (loading) return <div className="min-h-screen bg-kasi-dark flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Ranks...</div>;

  return (
    <div className="min-h-screen bg-kasi-dark pb-0 font-sans text-white">
      <AppTutorial run={runRankTour} steps={rankSteps} onComplete={handleTourFinish} />
      
      {/* HEADER */}
      <div className="p-6 pt-10 text-center">
          <h1 className="text-3xl font-black text-kasi-gold uppercase tracking-widest drop-shadow-md">Leaderboard</h1>
          <p className="text-gray-400 text-xs mt-2 font-medium tracking-wide">TOP EARNERS THIS MONTH</p>
      </div>

      {/* --- PODIUM SECTION --- */}
      <div className="flex justify-center items-end gap-3 px-4 mt-4 mb-10 tutorial-top3 min-h-[180px]">
          
          {/* 2ND PLACE */}
          <div className="flex flex-col items-center w-[30%]">
              {leaders[1] ? (
                  <>
                    <SafeAvatar user={leaders[1]} className="w-14 h-14 rounded-full border-2 border-white mb-3 shadow-lg" />
                    <div className="bg-[#2C303B] w-full h-28 rounded-t-xl flex flex-col justify-end p-2 text-center relative shadow-lg">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/5 font-black text-5xl">2</div>
                        <span className="text-[10px] font-bold truncate w-full block text-gray-300 mb-0.5">{leaders[1].name}</span>
                        <span className="text-xs font-black text-white">RM {leaders[1].balance?.toFixed(2)}</span>
                    </div>
                  </>
              ) : <div className="text-xs text-gray-600">Empty</div>}
          </div>

          {/* 1ST PLACE */}
          <div className="flex flex-col items-center relative w-[34%] -mt-8 z-10">
              {leaders[0] ? (
                  <>
                    <Crown className="text-kasi-gold absolute -top-[3.2rem] animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" size={40} />
                    <SafeAvatar user={leaders[0]} className="w-20 h-20 rounded-full border-4 border-kasi-gold mb-3 shadow-xl bg-kasi-dark" />
                    
                    <div className="bg-gradient-to-b from-[#3D414D] to-[#2C303B] w-full h-36 rounded-t-xl flex flex-col justify-end p-2 text-center border-t-4 border-kasi-gold relative shadow-2xl">
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 text-kasi-gold/10 font-black text-6xl">1</div>
                         <span className="text-xs font-bold truncate w-full block text-white mb-0.5">{leaders[0].name}</span>
                         <span className="text-sm font-black text-kasi-gold">RM {leaders[0].balance?.toFixed(2)}</span>
                    </div>
                  </>
               ) : <div className="text-xs text-gray-600">Empty</div>}
          </div>

          {/* 3RD PLACE */}
          <div className="flex flex-col items-center w-[30%]">
              {leaders[2] ? (
                  <>
                    <SafeAvatar user={leaders[2]} className="w-14 h-14 rounded-full border-2 border-white mb-3 shadow-lg" />
                    <div className="bg-[#2C303B] w-full h-24 rounded-t-xl flex flex-col justify-end p-2 text-center relative shadow-lg">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/5 font-black text-5xl">3</div>
                        <span className="text-[10px] font-bold truncate w-full block text-gray-300 mb-0.5">{leaders[2].name}</span>
                        <span className="text-xs font-black text-white">RM {leaders[2].balance?.toFixed(2)}</span>
                    </div>
                  </>
              ) : <div className="text-xs text-gray-600">Empty</div>}
          </div>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="bg-gray-50 rounded-t-[2.5rem] min-h-[500px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-10">
          
         {/* YOUR POSITION (STICKY HEADER) */}
          <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md rounded-t-[2.5rem] px-6 pt-6 pb-2 border-b border-gray-200 transition-all">
             <div className="bg-kasi-dark text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-gray-300/50">
                <div className="flex items-center gap-4">
                    <div className="shrink-0">
                         <SafeAvatar user={user} className="w-10 h-10 rounded-full border border-gray-600" />
                    </div>
                    
                    <div className="h-8 w-px bg-gray-700"></div>
                    
                    <div className="flex flex-col justify-center">
                        <p className="font-bold text-sm truncate max-w-[120px] leading-tight text-white">
                            {user?.name || user?.displayName || user?.email?.split('@')[0] || "You"}
                        </p>
                        <p className="text-xs text-kasi-gold font-black mt-0.5">
                            RM {user?.balance ? Number(user.balance).toFixed(2) : "0.00"}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Rank</span>
                    <span className="font-black text-xl text-white leading-none">{myRankDisplay}</span>
                </div>
            </div>
          </div>

          {/* THE RUNNER LIST */}
          <div className="px-6 py-4 space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 pl-2">Rest of the Best</h3>
              
              {leaders.slice(3).map((l, index) => (
                  <div key={l.id} className="flex items-center justify-between p-3 pl-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 overflow-hidden">
                          <span className="font-black text-gray-400 w-5 text-center text-sm shrink-0">{index + 4}</span>
                          <div className="flex items-center gap-3 overflow-hidden">
                              <SafeAvatar user={l} className="w-10 h-10 rounded-full text-[10px]" />
                              <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-800 truncate max-w-[140px]">{l.name}</p>
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className="font-black text-kasi-gold text-sm bg-yellow-50 px-2 py-1 rounded-lg">RM {l.balance?.toFixed(2)}</span>
                      </div>
                  </div>
              ))}
              
              {leaders.length <= 3 && (
                <div className="text-center py-10 opacity-50">
                    <p className="text-sm text-gray-500 font-bold">No other runners yet.</p>
                    <p className="text-xs text-gray-400">Be the next to join the leaderboard!</p>
                </div>
              )}
          </div>
      </div>
    </div>
  );
}

// 3. MAIN COMPONENT WITH SUSPENSE (This fixes Netlify Build)
export default function LeaderboardPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-kasi-dark flex items-center justify-center text-white">
            <Loader2 className="animate-spin mr-2"/> Initializing...
        </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}