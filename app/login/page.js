"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { loginUser } from "../../lib/auth"; // Ensure path is correct

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      router.push("/profile");
    } else {
      alert("Login Failed: " + result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-kasi-dark flex flex-col px-6 py-8 relative overflow-hidden text-white">
      
      {/* Background Effect */}
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <Link href="/" className="text-white mb-8 inline-block z-10">
        <ArrowLeft />
      </Link>

      <div className="mb-8 z-10">
        <h1 className="text-white text-4xl font-black mb-2">Welcome<br/>Back.</h1>
        <p className="text-gray-400">Let's make some money.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 z-10 relative">
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
          {/* ADDED name="email" HERE vvv */}
          <input 
            name="email"
            type="email" 
            required
            placeholder="Email Address" 
            className="w-full bg-white/10 border border-white/10 text-white py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-gray-500 transition-all"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
          {/* ADDED name="password" HERE vvv */}
          <input 
            name="password"
            type="password" 
            required
            placeholder="Password" 
            className="w-full bg-white/10 border border-white/10 text-white py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-gray-500 transition-all"
          />
        </div>

        <div className="text-right">
            <Link href="#" className="text-xs text-gray-400 hover:text-white">Forgot Password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-black font-black py-4 rounded-xl mt-4 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-auto text-center text-gray-500 text-sm z-10">
        Don't have an account? <Link href="/register" className="text-[#D4AF37] font-bold underline">Register</Link>
      </p>

    </div>
  );
}