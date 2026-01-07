"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { loginUser } from "../../lib/auth"; 

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Secret Admin Toggle: Click logo 5 times
  const handleSecretClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) setIsAdminMode(true);
      return newCount;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      alert("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    const result = await loginUser(email, password);

    if (result.success) {
      // Basic check: In a real app, you'd check a user role in the DB
      // For now, if in admin mode, we assume you want to go to admin dash
      if (isAdminMode) {
         router.push("/admin/tasks"); 
      } else {
         router.push("/tasks");
      }
    } else {
      alert("Login Failed: " + result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6 relative overflow-hidden text-white font-sans selection:bg-[#FFD700] selection:text-black">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FFD700] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white transition flex items-center gap-2">
        <ArrowLeft size={20} /> Back
      </Link>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header & Secret Trigger */}
        <div className="text-center mb-10 cursor-pointer select-none" onClick={handleSecretClick}>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {isAdminMode ? <span className="text-red-500">Admin Portal</span> : <>Welcome <span className="text-[#FFD700]">Back</span></>}
          </h1>
          <p className="text-gray-400">
            {isAdminMode ? "Restricted Access Only" : "Login to continue earning."}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-gray-500 group-focus-within:text-[#FFD700] transition-colors" size={20} />
            </div>
            <input 
              name="email"
              type="email" 
              required
              placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] placeholder-gray-600 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isAdminMode ? <ShieldCheck className="text-red-500" size={20}/> : <Lock className="text-gray-500 group-focus-within:text-[#FFD700] transition-colors" size={20} />}
            </div>
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
              placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-12 rounded-2xl focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] placeholder-gray-600 transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-bold text-gray-500 hover:text-[#FFD700] transition">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-black py-4 rounded-2xl mt-4 transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${
                isAdminMode 
                ? "bg-red-600 text-white hover:bg-red-500 shadow-red-900/20" 
                : "bg-[#FFD700] text-black hover:bg-[#E5C100] shadow-[#FFD700]/20"
            }`}
          >
            {isLoading ? "Authenticating..." : isAdminMode ? "Access Dashboard" : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          New here? <Link href="/register" className="text-[#FFD700] font-bold hover:underline">Create Account</Link>
        </p>

      </div>
    </div>
  );
}