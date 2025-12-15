"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name"); // <--- Get Name
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
      alert("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Pass 'name' to the function
    const result = await registerUser(email, password, name);

    if (result.success) {
      router.push("/profile");
    } else {
      alert("Registration failed: " + result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <form onSubmit={handleRegister} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        
        {/* ADDED NAME INPUT BACK */}
        <input 
          name="name" 
          type="text" 
          placeholder="Full Name" 
          required 
          className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white" 
        />

        <input name="email" type="email" placeholder="Email" required className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white" />
        <input name="password" type="password" placeholder="Password" required className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white" />
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl mt-4 disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}