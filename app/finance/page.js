"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FinancePage() {
  const router = useRouter();
  const [balance, setBalance] = useState(1250.00); // Mock balance
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("duitnow");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, date: "12 Oct", amount: 100, status: "pending", method: "TNG eWallet" },
    { id: 2, date: "05 Oct", amount: 50, status: "success", method: "Maybank" },
  ]);

  const handleWithdraw = (e) => {
    e.preventDefault();
    
    // Validation
    if (parseFloat(amount) > balance) {
      alert("Tak cukup duit boss! (Insufficient funds)");
      return;
    }

    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      // Add new transaction to history
      const newTx = {
        id: Date.now(),
        date: "Today",
        amount: parseFloat(amount),
        status: "pending",
        method: method === "duitnow" ? "DuitNow" : "TNG eWallet"
      };
      
      setHistory([newTx, ...history]);
      setBalance(balance - parseFloat(amount)); // Deduct local balance
      setAmount("");
      setIsLoading(false);
      alert("Withdrawal requested! Money will arrive in 24 hours.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-kasi-gray pb-24 relative">
      
      {/* HEADER */}
      <div className="bg-kasi-dark pt-12 pb-20 px-6 rounded-b-[2rem] relative z-10">
        <Link href="/profile" className="text-white mb-6 inline-block opacity-80 hover:opacity-100">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-white text-2xl font-black mb-1">Kasi Keluar</h1>
        <p className="text-gray-400 text-xs flex items-center gap-2">
          <Shield size={12} className="text-green-500" /> Secure Payment Gateway
        </p>
      </div>

      {/* BALANCE CARD (Floating) */}
      <div className="px-6 -mt-12 relative z-20">
        <div className="bg-white p-6 rounded-2xl shadow-float text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
          <h2 className="text-4xl font-black text-kasi-dark tracking-tight">
            RM {balance.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* WITHDRAWAL FORM */}
      <div className="px-6 mt-8">
        <h3 className="font-bold text-kasi-dark text-lg mb-4">Request Withdrawal</h3>
        
        <form onSubmit={handleWithdraw} className="bg-white p-5 rounded-2xl shadow-card space-y-4">
          
          {/* Method Selector */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button" 
                onClick={() => setMethod("duitnow")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${method === "duitnow" ? "border-kasi-gold bg-yellow-50 text-kasi-dark ring-1 ring-kasi-gold" : "border-gray-100 text-gray-400"}`}
              >
                <CreditCard size={20} />
                <span className="text-xs font-bold">DuitNow</span>
              </button>
              <button 
                type="button"
                onClick={() => setMethod("tng")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${method === "tng" ? "border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500" : "border-gray-100 text-gray-400"}`}
              >
                <div className="font-black text-sm">TNG</div>
                <span className="text-xs font-bold">eWallet</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Amount (RM)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 font-bold">RM</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                min="10"
                required
                className="w-full bg-gray-50 text-kasi-dark font-bold text-lg py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-kasi-gold"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">Min. withdrawal: RM 10.00</p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading || !amount}
            className="w-full bg-kasi-dark text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Confirm Withdrawal"}
          </button>

        </form>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="px-6 mt-8 mb-8">
        <h3 className="font-bold text-kasi-dark text-lg mb-4">History</h3>
        <div className="space-y-3">
          {history.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tx.status === "success" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                  {tx.status === "success" ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-kasi-dark">Withdraw to {tx.method}</p>
                  <p className="text-[10px] text-gray-400">{tx.date} • {tx.status}</p>
                </div>
              </div>
              <span className="text-kasi-dark font-black text-sm">- RM {tx.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}