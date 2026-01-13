"use client";
import { useState, useEffect } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from '@/lib/firebase'; 

export default function AvatarUpload({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(null);

  // --- NEW: FETCH FRESH URL ON MOUNT ---
  useEffect(() => {
    const fetchFreshUrl = async () => {
      // 1. If we just uploaded a new one (local state), use that
      if (displayUrl) return;

      // 2. If user has an avatarKey in Firestore, fetch a fresh link
      if (user?.avatarKey) {
        try {
          const res = await fetch(`/api/r2?key=${user.avatarKey}`);
          const data = await res.json();
          if (data.viewUrl) {
             setDisplayUrl(data.viewUrl);
             return;
          }
        } catch (e) {
          console.error("Failed to load avatar", e);
        }
      }

      // 3. Fallback to Auth photoURL if no key exists yet
      if (user?.photoURL) {
        setDisplayUrl(user.photoURL);
      }
    };

    fetchFreshUrl();
  }, [user]); // Re-run if user changes

  // --- NAME & COLOR LOGIC ---
  const getName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };
  const finalName = getName();

  const getInitials = (name) => {
    const cleanName = name.replace(/[^a-zA-Z\s]/g, ""); 
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // --- UPLOAD HANDLER ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("Image must be under 2MB");

    setUploading(true);
    try {
      // 1. Get Upload Link
      const res = await fetch('/api/r2', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, fileType: file.type, folder: 'avatars' })
      });
      const { uploadUrl, fileKey } = await res.json();

      // 2. Upload to Cloudflare
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      // 3. Get FRESH View URL (for immediate display)
      const viewRes = await fetch(`/api/r2?key=${fileKey}`);
      const { viewUrl } = await viewRes.json();

      // 4. Update Firebase Auth (Session)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: viewUrl });
      }

      // 5. Update Firestore (SAVE THE KEY!)
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { 
            photoURL: viewUrl, // Keep for legacy/backup
            avatarKey: fileKey // <--- THIS IS THE IMPORTANT PART
        });
      }

      // 6. Update UI immediately
      setDisplayUrl(viewUrl);
      
      // Notify parent to update local user state with the new key
      if (onUpdate) onUpdate({ photoURL: viewUrl, avatarKey: fileKey });

    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm("Remove profile picture?")) return;

    try {
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: "" });
      
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { photoURL: "", avatarKey: "" });
      }
      
      setDisplayUrl(null);
      if (onUpdate) onUpdate({ photoURL: "", avatarKey: "" });

    } catch (err) {
      console.error("Error removing photo:", err);
    }
  };

  return (
    <div className="relative group w-16 h-16 shrink-0">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative bg-gray-200"
        style={{ backgroundColor: !displayUrl ? stringToColor(finalName) : 'transparent' }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-black text-white tracking-wider">
            {getInitials(finalName)}
          </span>
        )}
      </div>

      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <label className="cursor-pointer p-1 hover:bg-white/20 rounded-full transition text-white" title="Upload Photo">
            {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera className="w-5 h-5" />}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
        {displayUrl && !uploading && (
            <button onClick={handleDelete} className="p-1 hover:bg-red-500/80 rounded-full transition text-white" title="Remove Photo">
                <Trash2 className="w-5 h-5" />
            </button>
        )}
      </div>
    </div>
  );
}