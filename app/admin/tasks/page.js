"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <--- Import Router
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Eye, Users } from "lucide-react"; // <--- Added Users icon

export default function AdminTaskList() {
  const router = useRouter(); // <--- Init Router
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent clicking the row when deleting
    if(!confirm("Delete this task? This will also hide it from users.")) return;
    await deleteDoc(doc(db, "tasks", id));
    loadTasks();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-black text-gray-900">Task Manager</h1>
           <p className="text-gray-500 text-sm">Manage tasks and view submission performance.</p>
        </div>
        <Link href="/admin/tasks/add" className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-200">
           <Plus size={20}/> Add New Task
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">Title</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">Reward</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">Progress</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">Status</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const limit = task.limit || 0;
                const done = task.completedCount || 0;
                const remaining = limit === 0 ? "∞" : Math.max(0, limit - done);
                
                return (
                  <tr 
                    key={task.id} 
                    // Make the whole row clickable
                    onClick={() => router.push(`/admin/tasks/${task.id}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/50 transition cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-gray-900 max-w-[200px] truncate">
                        {task.title}
                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{task.readableId}</span>
                    </td>
                    <td className="p-4 font-mono text-green-600 font-bold">RM {task.reward}</td>
                    <td className="p-4 text-sm font-medium">
                        {limit === 0 ? <span className="text-blue-500 font-bold">Unlimited</span> : <span className="text-gray-700">{done} / {limit}</span>}
                    </td>
                    <td className="p-4">
                      {task.isActive 
                        ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Active</span> 
                        : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">Inactive</span>
                      }
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/tasks/${task.id}`); }} 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg group-hover:bg-white border border-transparent group-hover:border-blue-100 transition"
                        title="View Submissions"
                      >
                        <Users size={18}/>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(task.id, e)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}