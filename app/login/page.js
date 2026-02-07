"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../lib/auth"; // Ensure this returns { success, user: { role: 'admin' } } if possible

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData.get("email"), formData.get("password"));

    if (result.success) {
      // Check role from result (assuming loginUser returns user data) 
      // OR fetch it briefly. For now, we redirect to tasks, and the layout/middleware handles protection.
      if (result.user?.role === 'admin') {
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

      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white transition flex items-center gap-2">
        <ArrowLeft size={20} /> Back
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Welcome <span className="text-[#FFD700]">Back</span></h1>
          <p className="text-gray-400">Login to continue earning.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group relative">
            <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" size={20} />
            <input name="email" type="email" required placeholder="Email Address" className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none transition-all" />
          </div>

          <div className="group relative">
            <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" size={20} />
            <input name="password" type={showPassword ? "text" : "password"} required placeholder="Password" className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-12 rounded-2xl focus:border-[#FFD700] outline-none transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500 hover:text-white">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-bold text-gray-500 hover:text-[#FFD700] transition">Forgot Password?</Link>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-[#FFD700] text-black font-black py-4 rounded-2xl mt-4 hover:bg-[#E5C100] shadow-lg shadow-[#FFD700]/20 active:scale-95 transition-all">
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          New here? <Link href="/register" className="text-[#FFD700] font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}