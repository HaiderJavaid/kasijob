"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff, Calendar, Users } from "lucide-react";
import { registerUser } from "../../lib/auth"; 

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
        if (!formData.name || !formData.age) return alert("Please fill in all fields.");
        setStep(2);
    } else if (step === 2) {
        if (!formData.email || !formData.password || !formData.confirmPassword) return alert("Please fill in all fields.");
        if (formData.password !== formData.confirmPassword) return alert("Passwords do not match!");
        if (formData.password.length < 6) return alert("Password too short.");
        setStep(3);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) return alert("You must agree to the Terms & Conditions.");

    setIsLoading(true);
    try {
      // Pass extra data (age/gender) if your registerUser supports it, or save separately
      const result = await registerUser(formData.email, formData.password, formData.name);

      if (result.success) {
        setStep(4); // Success Screen
        setTimeout(() => router.push("/tasks"), 2000);
      } else {
        alert("Registration failed: " + result.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6 relative overflow-hidden text-white font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white transition flex items-center gap-2">
              <ArrowLeft size={20} /> Back
            </Link>

      {/* Background Ambience */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-blue-600"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#FFD700] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

      {step < 4 && (
        <div className="w-full max-w-md relative z-10">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${step >= i ? "bg-[#FFD700]" : "bg-white/10"}`}></div>
                ))}
            </div>

            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black mb-2">Who are you?</h1>
                        <p className="text-gray-400">Basic details to get started.</p>
                    </div>
                    <form onSubmit={handleNextStep} className="space-y-4">
                        <div className="group relative">
                            <User className="absolute left-4 top-4 text-gray-500" size={20} />
                            <input name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                                <Calendar className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input name="age" type="number" placeholder="Age" required value={formData.age} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none" />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-4 top-4 text-gray-500" size={20} />
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none appearance-none">
                                    <option value="male" className="text-black">Male</option>
                                    <option value="female" className="text-black">Female</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition">Next <ArrowRight size={20}/></button>
                    </form>
                </div>
            )}

            {/* STEP 2: CREDENTIALS */}
            {step === 2 && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black mb-2">Secure Access</h1>
                        <p className="text-gray-400">Your login details.</p>
                    </div>
                    <form onSubmit={handleNextStep} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 text-gray-500" size={20} />
                            <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
                            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-12 rounded-2xl focus:border-[#FFD700] outline-none" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
                            <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm Password" required value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-12 rounded-2xl focus:border-[#FFD700] outline-none" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500 hover:text-white"><Eye size={20}/></button>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/10 text-gray-400 font-bold py-4 rounded-2xl hover:bg-white/5">Back</button>
                            <button type="submit" className="flex-[2] bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200">Next</button>
                        </div>
                    </form>
                </div>
            )}

            {/* STEP 3: TERMS */}
            {step === 3 && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black mb-2">Final Step</h1>
                        <p className="text-gray-400">Review and accept.</p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-sm text-gray-400 h-40 overflow-y-auto">
                            <p className="mb-2 font-bold text-white">Terms & Conditions</p>
                            <p>By registering, you agree to complete tasks honestly. Fake proofs will result in a ban. Payments are processed on the 5th of every month. KasiJobs reserves the right to suspend suspicious accounts...</p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-5 h-5 rounded border-gray-600 text-[#FFD700] focus:ring-[#FFD700]" />
                            <span className="text-sm text-gray-300">I agree to the Terms & Conditions</span>
                        </label>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(2)} className="flex-1 border border-white/10 text-gray-400 font-bold py-4 rounded-2xl hover:bg-white/5">Back</button>
                            <button type="submit" disabled={isLoading} className="flex-[2] bg-[#FFD700] text-black font-black py-4 rounded-2xl hover:bg-[#E5C100] shadow-lg disabled:opacity-50">
                                {isLoading ? "Creating Account..." : "Finish Signup"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className="text-center animate-scale-up z-10">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-500 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome Aboard!</h1>
            <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      )}

      <p className="mt-8 text-center text-gray-500 text-sm">
          Already a member? <Link href="/login" className="text-[#FFD700] font-bold hover:underline">Login Now</Link>
        </p>
    </div>

    
  );
}