import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-kasi-dark px-6 text-center">
    
      {/* Logo Area */}
   
      <div className="mb-8 animate-pulse">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Kasi<span className="text-kasi-gold">Jobs</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Rojak jobs for everyone.</p>
      </div>

      {/* Hero Image Placeholder (We can add a real one later) */}
      <div className="w-full h-48 bg-gray-800 rounded-2xl mb-8 flex items-center justify-center border border-gray-700">
        <span className="text-gray-500 text-xs">Hero Image Area</span>
      </div>

      {/* Buttons */}
      <div className="w-full space-y-4">
        <Link href="/login" className="block w-full bg-kasi-gold text-kasi-dark font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform">
          Jom Masuk
        </Link>
        
        <Link href="/register" className="block w-full bg-transparent border border-gray-600 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors">
          Create Account
        </Link>
      </div>

      <p className="mt-8 text-gray-500 text-xs">
        Nak cari makan? Sign up here.
      </p>
    </div>
  );
}