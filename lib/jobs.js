// lib/jobs.js
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// 1. SAVE JOB (To Cloud)
export async function saveJob(jobData) {
  try {
    // We add a 'createdAt' timestamp so we can sort later
    await addDoc(collection(db, "jobs"), {
      ...jobData,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error saving job:", error);
    return false;
  }
}

// 2. GET ALL JOBS (From Cloud + Mock Backup)
export async function getAllJobs(mockJobs) {
  try {
    const jobsRef = collection(db, "jobs");
    // Sort by newest first (descending order)
    // Note: You might need to create an index in Firebase Console if this warns you, 
    // but for small data it often works or just remove 'orderBy' if it errors.
    const q = query(jobsRef); 
    
    const snapshot = await getDocs(q);
    
    const cloudJobs = snapshot.docs.map(doc => ({
      id: doc.id, // Use Firebase ID
      ...doc.data()
    }));

    // Merge Cloud Jobs (Top) + Mock Jobs (Bottom)
    return [...cloudJobs, ...mockJobs];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return mockJobs; // Fallback to mock data if offline
  }
}