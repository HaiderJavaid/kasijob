"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, ArrowRight, CheckCircle, Eye, Calendar, Users, Loader2, XCircle, AlertCircle } from "lucide-react";
import { registerUser } from "../../lib/auth"; 
import { generateReferralCode, processReferral } from "../../lib/referralUtils"; 
import { updateDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- USERNAME LOGIC STATE ---
  const [checkingUser, setCheckingUser] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null); 
  const [usernameError, setUsernameError] = useState(null);

  const [formData, setFormData] = useState({
    username: "", 
    dob: "", 
    gender: "male",
    email: "", 
    password: "", 
    confirmPassword: "",
    referralCode: "", 
    agreeTerms: false
  });

  // --- 1. HANDLE USERNAME INPUT (Validation) ---
  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase();
    setFormData({ ...formData, username: val });
    setUsernameAvailable(null); 
    
    // Live Validation
    if (val.length === 0) {
        setUsernameError(null);
        return;
    }
    if (/\s/.test(val)) {
        setUsernameError("No spaces allowed");
        return;
    }
    if (!/^[a-z0-9_.]+$/.test(val)) {
        setUsernameError("Only letters, numbers, . and _ allowed");
        return;
    }
    if (val.length < 4) {
        setUsernameError("Too short (Min 4 chars)");
        return;
    }
    if (val.length > 16) {
        setUsernameError("Too long (Max 16 chars)");
        return;
    }
    setUsernameError(null);
  };

  // --- 2. CHECK DB AVAILABILITY (Queries 'name' field) ---
  useEffect(() => {
    const checkUniqueness = async () => {
        if (usernameError || formData.username.length < 4) return;

        setCheckingUser(true);
        try {
            // ⚠️ HERE IS THE CHANGE: We check the 'name' field, not 'username'
            const q = query(collection(db, "users"), where("name", "==", formData.username));
            const snap = await getDocs(q);
            
            if (!snap.empty) {
                setUsernameAvailable(false);
                setUsernameError("Username is already taken");
            } else {
                setUsernameAvailable(true);
                setUsernameError(null);
            }
        } catch (err) {
            console.error("Check error:", err);
        }
        setCheckingUser(false);
    };

    const timer = setTimeout(checkUniqueness, 500); 
    return () => clearTimeout(timer);
  }, [formData.username, usernameError]);


  // --- STANDARD HANDLERS ---
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
        if (!formData.username || !formData.dob) return alert("Please fill in all fields.");
        if (usernameError || usernameAvailable === false) return alert("Please fix username errors.");
        if (checkingUser) return;
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
      // 1. Create Auth User
      // We pass formData.username as the 'name' argument
      const result = await registerUser(
          formData.email, formData.password, formData.username, formData.dob, formData.gender
      );

      if (result.success) {
        const newUserId = result.user.uid;
        const myNewCode = generateReferralCode();
        
        // 2. Save User Data to Firestore
        // ⚠️ HERE IS THE CHANGE: We save to 'name', not 'username'
        await updateDoc(doc(db, "users", newUserId), { 
            referralCode: myNewCode,
            name: formData.username, // Saving as 'name'
            // We do NOT save 'username' field anymore
        });

        if (formData.referralCode) {
            await processReferral(newUserId, formData.referralCode);
        }

        setStep(4);
        setTimeout(() => router.push("/tasks"), 4000);
      } else {
        alert("Registration failed: " + result.error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const getInputBorder = (isError, isSuccess) => {
    if (isError) return "border-red-500/50 focus:border-red-500 bg-red-500/10";
    if (isSuccess) return "border-green-500/50 focus:border-green-500 bg-green-500/10";
    return "bg-white/5 border-white/10 focus:border-[#FFD700]";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center px-6 relative overflow-hidden text-white font-sans selection:bg-[#FFD700] selection:text-black">
      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white transition flex items-center gap-2">
         <ArrowLeft size={20} /> Back
      </Link>

      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#FFD700] to-blue-600"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#FFD700] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

      {step < 4 && (
        <div className="w-full max-w-md relative z-10">
            <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${step >= i ? "bg-[#FFD700]" : "bg-white/10"}`}></div>
                ))}
            </div>

            {/* STEP 1: USERNAME (Saved as Name) */}
            {step === 1 && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black mb-2">Who are you?</h1>
                        <p className="text-gray-400">Create your unique username.</p>
                    </div>
                    <form onSubmit={handleNextStep} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-gray-500" size={20} />
                            <input 
                                name="username" 
                                type="text" 
                                placeholder="Username (e.g. crypto_king)" 
                                required 
                                autoComplete="off"
                                value={formData.username} 
                                onChange={handleUsernameChange} 
                                className={`w-full border text-white py-4 pl-12 pr-12 rounded-2xl outline-none transition-all ${getInputBorder(usernameError, usernameAvailable)}`} 
                            />
                            <div className="absolute right-4 top-4">
                                {checkingUser ? <Loader2 className="animate-spin text-gray-500" size={20}/> :
                                 usernameError ? <XCircle className="text-red-500" size={20}/> :
                                 usernameAvailable ? <CheckCircle className="text-green-500" size={20}/> : null}
                            </div>
                        </div>

                        {usernameError && (
                            <p className="text-xs text-red-400 font-bold ml-4 -mt-2 flex items-center gap-1">
                                <AlertCircle size={12}/> {usernameError}
                            </p>
                        )}
                        
                        {!usernameError && !usernameAvailable && formData.username.length > 0 && (
                            <p className="text-[10px] text-gray-500 ml-4 -mt-2">4-16 chars • Letters, numbers, _ .</p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                                <Calendar className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input name="dob" type="date" required value={formData.dob} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-2 rounded-2xl focus:border-[#FFD700] outline-none [color-scheme:dark]" />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-4 top-4 text-gray-500" size={20} />
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none appearance-none">
                                    <option value="male" className="text-black">Male</option>
                                    <option value="female" className="text-black">Female</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!!usernameError || !usernameAvailable && formData.username.length > 0}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ArrowRight size={20}/>
                        </button>
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
                        <div className="relative">
                           <Users className="absolute left-4 top-4 text-gray-500" size={20} />
                           <input name="referralCode" type="text" placeholder="Referral Code (Optional)" value={formData.referralCode} onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-[#FFD700] outline-none uppercase tracking-widest placeholder-gray-600" />
                           <p className="text-[10px] text-gray-500 mt-1 ml-2">Enter code to get RM2.00 bonus.</p>
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
                            <p>By registering, you agree to complete tasks honestly...</p>
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
            <p className="text-gray-400 mb-4">Account created successfully.</p>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 max-w-xs mx-auto">
                <p className="text-sm font-bold text-[#FFD700] mb-1">Check your inbox!</p>
                <p className="text-xs text-gray-300">We sent a verification link to {formData.email}. Please verify to unlock all tasks.</p>
            </div>
        </div>
      )}

      <p className="mt-8 text-center text-gray-500 text-sm">
          Already a member? <Link href="/login" className="text-[#FFD700] font-bold hover:underline">Login Now</Link>
      </p>
    </div>
  );
}