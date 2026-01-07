"use client";
import Link from "next/link";
import Mascot from "../components/Mascot"; 
import { ArrowRight, Briefcase, Zap, Calendar, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-[#FFD700] selection:text-black">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-lg bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#FFD700] rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_#FFD700]">
            K
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:block">Kasi<span className="text-[#FFD700]">Jobs</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition">
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-black transition hover:bg-gray-200 hover:scale-105 active:scale-95"
          >
            Join Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
        
        {/* TEXT CONTENT */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Malaysia's #1 Gig Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
            Real Work. <br/>
            <span className="text-[#FFD700] drop-shadow-[0_0_25px_rgba(255,215,0,0.3)]">
              Real Payday.
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Not just a reward app. A freelance ecosystem. Complete digital tasks, local gigs, or creative work. 
            <br/><span className="text-white font-bold">We clear your balance on the 5th. Guaranteed.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              href="/register" 
              className="bg-[#FFD700] text-black font-black text-lg px-8 py-4 rounded-2xl hover:bg-[#E5C100] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,215,0,0.2)] hover:translate-y-[-2px]"
            >
              Start Earning <ArrowRight size={20} strokeWidth={3} />
            </Link>
            <Link 
              href="/login" 
              className="bg-[#1A1A1A] text-white font-bold text-lg px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition flex items-center justify-center"
            >
              Log In
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#0a0a0a] bg-gray-${i*100 + 400}`}></div>
               ))}
            </div>
            <p>Trust by <span className="text-white font-bold">50+ Pioneers</span></p>
          </div>
        </div>

        {/* MASCOT VISUAL */}
        <div className="flex-1 flex justify-center items-center relative z-10 w-full max-w-[500px] md:max-w-none mt-10 md:mt-0">
          <div className="relative w-full h-[400px] md:w-[600px] md:h-[600px] flex items-center justify-center">
             
             {/* The Mascot Component */}
             <div className="scale-150 md:scale-155 transition-transform duration-700">
                <Mascot />
             </div>
             
             {/* Floating Cards
             <div className="absolute top-0 right-0 md:-right-10 bg-[#151515] p-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce delay-700">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-900/50 rounded-full flex items-center justify-center text-green-400">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Next Payday</p>
                      <p className="text-sm font-bold text-white">5th of Month</p>
                   </div>
                </div>
             </div>

             <div className="absolute bottom-10 -left-4 md:-left-10 bg-[#151515] p-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400">
                      <Briefcase size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">New Gig</p>
                      <p className="text-sm font-bold text-white">Logo Design (RM50)</p>
                   </div>
                </div>
             </div> */}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 px-6 bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">More Than Just <span className="text-[#FFD700]">Tasks</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              We combine the ease of reward apps with the earning potential of freelancing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap size={32} />}
              title="Micro-Tasks"
              desc="Quick earnings. Watch ads, install apps, or answer surveys. Perfect for spare time."
              color="text-yellow-400"
              bg="bg-yellow-400/10"
            />
            <FeatureCard 
              icon={<Briefcase size={32} />}
              title="Freelance Gigs"
              desc="Real work. Design, writing, or local help. Higher pay for your specialized skills."
              color="text-blue-400"
              bg="bg-blue-400/10"
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />}
              title="Guaranteed Pay"
              desc="No more 'Minimum Withdrawal' scams. We clear everyone's balance on the 5th."
              color="text-green-400"
              bg="bg-green-400/10"
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#FFD700] to-[#FDB931] rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-black text-4xl md:text-6xl font-black mb-6">Ready to get paid?</h2>
            <p className="text-black/80 text-xl font-medium mb-8 max-w-lg mx-auto">
              Join the community of Malaysians turning their free time into a secondary income.
            </p>
            <Link 
              href="/register" 
              className="inline-flex bg-black text-white font-black text-lg px-10 py-5 rounded-2xl hover:scale-105 transition-transform items-center gap-3"
            >
              Create Free Account <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-gray-700 text-sm">
        <p>&copy; 2025 KasiJobs. Built for the hustlers.</p>
      </footer>

      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-12">Frequently Asked <span className="text-[#FFD700]">Questions</span></h2>
            <div className="space-y-4">
                <FaqItem q="Is KasiJobs free to join?" a="Yes! It is 100% free. We never ask for payment to start working." />
                <FaqItem q="When do I get paid?" a="We process all withdrawals on the 5th of every month directly to your bank or TNG eWallet." />
                <FaqItem q="Can I work from home?" a="Absolutely. All tasks are digital and can be done from your phone anywhere." />
                <FaqItem q="How much can I earn?" a="It depends on your effort. Some users earn RM50/month, others earn RM500+ by doing gig work." />
            </div>
        </div>
      </section>

      {/* --- CONTACT & ABOUT (New) --- */}
      <section className="py-20 px-6 bg-[#111] border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">About KasiJobs</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
                Founded in Malaysia, we aim to connect businesses with real people for authentic engagement. 
                We believe in fair pay for digital work.
            </p>
            <div className="flex justify-center gap-6">
                <Link href="#" className="text-gray-400 hover:text-[#FFD700]">Contact Support</Link>
                <Link href="#" className="text-gray-400 hover:text-[#FFD700]">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-[#FFD700]">Terms of Service</Link>
            </div>
            <p className="text-gray-600 text-sm mt-12">&copy; 2025 KasiJobs Malaysia.</p>
        </div>
      </section>


    </div>
  );
}

function FeatureCard({ icon, title, desc, color, bg }) {
  return (
    <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 hover:border-[#FFD700]/30 transition-all hover:-translate-y-2 group">
      <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-base">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 hover:border-[#FFD700]/20 transition">
        <h3 className="font-bold text-white mb-2">{q}</h3>
        <p className="text-gray-400 text-sm">{a}</p>
    </div>
  );
}


