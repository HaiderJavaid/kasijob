"use client";
import Link from "next/link";
import Mascot from "../components/Mascot"; 
import { ArrowRight, Briefcase, ChevronDown, Clock, MapPin, Search, ShieldCheck, Zap } from "lucide-react";

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
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Malaysia&apos;s #1 Gig Platform</span>
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

      {/* --- JOBS PREVIEW SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#f3f4f6] px-4 pb-24 pt-4 sm:px-6">
        <div className="mx-auto hidden max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:block">
          <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-white/10 p-8 md:p-10 lg:border-b-0 lg:border-r">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD700] text-black">
                <Briefcase size={24} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
                Peek inside the jobs board.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                Browse small paid jobs, see budgets, and register interest once you join KasiJobs.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFD700] px-6 py-4 text-sm font-black text-black transition hover:bg-[#E5C100] active:scale-95"
                >
                  Unlock Jobs <ArrowRight size={18} strokeWidth={3} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  I have an account
                </Link>
              </div>
            </div>

            <div className="relative min-h-[620px] bg-[#f3f4f6] p-4 text-[#111] sm:p-6 md:p-8">
              <div className="rounded-[1.5rem] bg-[#111] px-5 py-6 text-white shadow-xl">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#FFD700]">
                      KasiJobs Marketplace
                    </p>
                    <h3 className="mt-1 text-2xl font-black">Available jobs</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-gray-300">
                    <Search size={16} />
                    Search gigs
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {previewStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">{stat.label}</p>
                      <p className="mt-2 text-xl font-black">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {previewJobs.map((job) => (
                  <JobPreviewCard key={job.title} job={job} />
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#f3f4f6] via-[#f3f4f6]/95 to-transparent"></div>
              <div className="absolute inset-x-4 bottom-6 z-10 mx-auto max-w-xl rounded-2xl border border-white/20 bg-black/80 p-5 text-center text-white shadow-2xl backdrop-blur-md sm:inset-x-8">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700] text-black">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-xl font-black">Register to see full jobs</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Create a free account to open listings, apply, and message posters.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[26rem] md:hidden">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f3f4f6] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <details className="group rounded-[1.5rem] bg-[#111] px-5 py-6 text-white shadow-xl">
              <summary className="list-none cursor-pointer">
                <div className="inline-flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-4 text-sm font-bold text-gray-300">
                  <Search size={16} />
                  <span className="flex-1">Search gigs</span>
                  <ChevronDown size={16} className="transition group-open:rotate-180" />
                </div>
              </summary>

              <div className="mt-5 grid gap-3">
                {previewStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">{stat.label}</p>
                    <p className="mt-2 text-xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-4">
                {previewJobs.map((job) => (
                  <JobPreviewCard key={job.title} job={job} />
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/20 bg-black/80 p-5 text-center text-white backdrop-blur-md">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700] text-black">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-xl font-black">Register to see full jobs</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Create a free account to open listings, apply, and message posters.
                </p>
              </div>
            </details>
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

const previewJobs = [
  {
    category: "Design",
    title: "Poster for weekend promo",
    description: "Create a clean social poster and story version for a local food stall campaign.",
    budget: "RM 80",
    location: "Remote",
  },
  {
    category: "Local help",
    title: "Event crew for pop-up booth",
    description: "Help set up, greet visitors, and pack down a small booth at a community market.",
    budget: "RM 120",
    location: "On-site",
  },
  {
    category: "Writing",
    title: "Product captions in Malay",
    description: "Write short, friendly captions for ten marketplace products with clear benefits.",
    budget: "RM 60",
    location: "Remote",
  },
  {
    category: "Testing",
    title: "Try a new mobile signup flow",
    description: "Record notes and screenshots while testing a beta signup flow on your phone.",
    budget: "RM 35",
    location: "Remote",
  },
];

const previewStats = [
  { label: "Open jobs", value: "32" },
  { label: "Today's payout", value: "Paid Today RM2,652" },
  { label: "Total Users", value: "157" },
];

function JobPreviewCard({ job }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111] text-[#FFD700]">
            <Briefcase size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
              {job.category}
            </p>
            <h3 className="mt-1 text-lg font-black leading-tight text-[#111]">
              {job.title}
            </h3>
          </div>
        </div>
        <ArrowRight size={18} className="mt-1 shrink-0 text-gray-300" />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
        {job.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[#111]">{job.budget}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
          <MapPin size={12} />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
          <Clock size={12} />
          Open
        </span>
      </div>
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
