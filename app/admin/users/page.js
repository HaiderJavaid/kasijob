"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { User, Wallet } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-8">User Database</h1>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="p-4 text-xs uppercase text-gray-400">User</th>
                        <th className="p-4 text-xs uppercase text-gray-400">Email</th>
                        <th className="p-4 text-xs uppercase text-gray-400">Balance</th>
                        <th className="p-4 text-xs uppercase text-gray-400">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-50">
                            <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><User size={16}/></div>
                                {u.name || "Anon"}
                            </td>
                            <td className="p-4 text-sm text-gray-500">{u.email}</td>
                            <td className="p-4 font-mono font-bold text-green-600">RM {u.balance?.toFixed(2)}</td>
                            <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold uppercase">{u.role || 'user'}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}