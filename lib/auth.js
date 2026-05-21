import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification // <--- IMPORT THIS
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { syncEmailVerification } from "./verification";

// --- REGISTER USER (Updated for DOB & Verification) ---
export const registerUser = async (email, password, name, dob, gender) => {
  try {
    if (!email || !password || !name) return { success: false, error: "Missing fields" };

    // 1. Check if user exists
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return { success: false, error: "User already exists" };

    // 2. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Send Verification Email
    try {
        await sendEmailVerification(user);
    } catch (emailError) {
        console.warn("Could not send verification email:", emailError);
        // We continue anyway, just logging the error
    }

    // 4. Save to Database
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      dob: dob,       // <--- Saved
      gender: gender, // <--- Saved
      balance: 0,
      createdAt: new Date(),
      isVerified: false,
      emailVerified: Boolean(user.emailVerified),
      verificationStatus: user.emailVerified ? "email_verified" : "unverified"
    });

    if (typeof window !== 'undefined') {
      document.cookie = `kasi_auth=${user.uid}; path=/; max-age=2592000; SameSite=Lax`;
    }

    return { success: true, user };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: error.message };
  }
};

// ... (Keep the rest of your functions: loginUser, logoutUser, etc.)
export const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (typeof window !== 'undefined') {
        document.cookie = `kasi_auth=${result.user.uid}; path=/; max-age=2592000; SameSite=Lax`;
      }
      await syncEmailVerification(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
};
  
export const logoutUser = async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        document.cookie = "kasi_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
};
  
export const getCurrentUser = () => {
    if (!auth) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
};

export const updateUserBalance = async (userId, amount) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: amount
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating balance:", error);
      return { success: false, error: error.message };
    }
};
