"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { LogOut, Wallet, Star, ChevronRight, Zap } from "lucide-react"; 

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setUser(docSnap.data());
        } else {
          setUser({
              email: currentUser.email,
              name: "User",
              uid: currentUser.uid,
              balance: 0
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      
      {/* Top Header Section */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">My Profile</h1>
          <button onClick={() => auth.signOut()} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 transition">
            <LogOut size={20} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-kasi-gold/10 flex items-center justify-center text-2xl font-bold text-kasi-gold border-2 border-kasi-gold">
            {/* Safety Check for Name */}
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
                {user?.name || "Anonymous User"}
            </h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-kasi-gold p-5 rounded-3xl shadow-lg text-kasi-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={40} /></div>
                <p className="text-kasi-black/80 text-xs font-medium uppercase tracking-wider">Total Balance</p>
                <p className="text-3xl font-black mt-1">${user?.balance || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-[#D4AF37]"><Star size={40} /></div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Status</p>
                <p className="text-xl font-bold mt-1 text-gray-900">Free Plan</p>
                <p className="text-xs text-green-500 font-bold mt-1">Active</p>
            </div>
        </div>

        {/* Missions / Menu Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-lg px-2">Quick Actions</h3>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Zap size={20} /></div>
                <span className="font-semibold text-gray-700">Daily Missions</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Wallet size={20} /></div>
                <span className="font-semibold text-gray-700">Withdraw Funds</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
               <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Star size={20} /></div>
                <span className="font-semibold text-gray-700">Upgrade Plan</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}


  {/* */}
//   return (
//     <div className="min-h-screen bg-kasi-gray pb-24">
      
//       {/* 1. TOP HEADER (Black) */}
//       <div className="bg-kasi-dark pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative z-10">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-white text-xl font-bold">My Profile</h1>
//           <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
//             <Settings size={20} />
//           </button>
//         </div>

//         {/* User Info - NOW DYNAMIC */}
//         <div className="flex items-center gap-4">
//           <div className="w-16 h-16 rounded-full bg-gray-300 border-2 border-kasi-gold flex items-center justify-center text-2xl">
//            {/* --- THE FIX IS HERE --- */}
//             {/* We use ?. and || to prevent the crash */}
//             {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <h2 className="text-white text-lg font-bold">{user.name}</h2>
//             <p className="text-gray-400 text-xs">{user.email}</p>
//           </div>
//         </div>
//       </div>

//       {/* 2. THE WALLET CARD (Floating Overlay) */}
//       <div className="px-6 -mt-16 relative z-20">
//         <div className="bg-kasi-gold rounded-2xl p-6 shadow-float text-kasi-dark">
//           <div className="flex justify-between items-start mb-2">
//             <div className="flex items-center gap-2 opacity-80">
//               <Wallet size={18} />
//               <span className="text-xs font-bold uppercase tracking-wider">Baki Dompet</span>
//             </div>
//            <Link href="/finance">
//   <button className="bg-kasi-dark text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md active:scale-95 transition-transform cursor-pointer">
//     Withdraw
//   </button>
// </Link>
//           </div>
          
//           {/* Dynamic Balance */}
//           <div className="text-4xl font-black tracking-tight mb-1">
//             {user.balance || "RM 0.00"}
//           </div>
//           <p className="text-sm font-medium opacity-70">
//             +500 Points (Redeemable)
//           </p>
//         </div>
//       </div>

//       {/* ... (Keep the rest of the Stats Grid & History code exactly the same) ... */}
      
//       {/* 3. STATS GRID */}
//       <div className="px-6 mt-6 grid grid-cols-2 gap-4">
//         {/* Card 1 */}
//         <div className="bg-white p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
//           <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
//             <CheckCircle size={20} />
//           </div>
//           <span className="text-2xl font-black text-kasi-dark">12</span>
//           <span className="text-xs text-gray-400 font-medium">Jobs Done</span>
//         </div>

//         {/* Card 2 */}
//         <div className="bg-white p-4 rounded-2xl shadow-card flex flex-col items-center justify-center text-center">
//           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
//             <Clock size={20} />
//           </div>
//           <span className="text-2xl font-black text-kasi-dark">85</span>
//           <span className="text-xs text-gray-400 font-medium">Tasks Done</span>
//         </div>
//       </div>
      
//       {/* ... History Section ... */}
//       <div className="px-6 mt-8">
//       <h3 className="text-kasi-dark font-bold text-lg mb-4">Recent Activity</h3>
      
//       <div className="space-y-3">
//         {/* If no history, show message */}
//         {(!user.history || user.history.length === 0) && (
//             <p className="text-gray-400 text-xs italic">No activity yet. Go do some tasks!</p>
//         )}

//         {/* Map through the Real History */}
//         {user.history && user.history.map((item) => (
//           <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="bg-yellow-100 p-2 rounded-lg">⚡</div>
//               <div>
//                 <p className="text-sm font-bold text-kasi-dark">{item.title}</p>
//                 <p className="text-[10px] text-gray-400">{item.date}</p>
//               </div>
//             </div>
//             <span className="text-green-600 font-bold text-sm">{item.amount}</span>
//           </div>
//         ))}
//       </div>
//     </div>

//     </div>
//   );
// }