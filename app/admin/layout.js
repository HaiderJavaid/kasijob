"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  LayoutDashboard, PlusCircle, CheckSquare, Users, 
  ArrowLeft, ShieldCheck, Menu, X // <--- Added Menu & X icons
} from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <--- New State

  // --- ADMIN CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists() && snap.data().role === "admin") {
            setIsAdmin(true);
          } else {
            router.push("/tasks"); 
          }
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#FFD700] font-bold">Verifying Access...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      
      {/* MOBILE HEADER (Hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#111] text-white p-4 flex justify-between items-center z-50 border-b border-white/10">
           <div className="flex items-center gap-2">
             <ShieldCheck className="text-red-500" size={20}/>
             <span className="font-black text-white">ADMIN</span>
           </div>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white">
             {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
           </button>
      </div>

      {/* SIDEBAR (Desktop + Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#111] text-white flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-white/10 hidden md:block">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-red-500"/> Admin
          </h2>
          <p className="text-xs text-gray-500 mt-1">KasiJobs Control Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-14 md:mt-0">
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={20}/>} label="Overview" active={pathname === "/admin"} onClick={() => setIsSidebarOpen(false)} />
          <AdminNavLink href="/admin/tasks" icon={<CheckSquare size={20}/>} label="Task List" active={pathname === "/admin/tasks"} onClick={() => setIsSidebarOpen(false)} />
          <AdminNavLink href="/admin/reviews" icon={<CheckSquare size={20}/>} label="Review Proofs" active={pathname.startsWith("/admin/reviews")} onClick={() => setIsSidebarOpen(false)} />
          <AdminNavLink href="/admin/users" icon={<Users size={20}/>} label="User List" active={pathname.startsWith("/admin/users")} onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/tasks" className="flex items-center gap-3 text-gray-400 hover:text-[#FFD700] transition p-3 rounded-xl hover:bg-white/5">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Back to App</span>
          </Link>
        </div>
      </aside>

      {/* OVERLAY (Mobile only) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            {children}
        </div>
      </main>

    </div>
  );
}

function AdminNavLink({ href, icon, label, active, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active 
        ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
        : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}