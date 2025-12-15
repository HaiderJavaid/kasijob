import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

// --- REGISTER USER ---
// Added 'name' here vvv
export const registerUser = async (email, password, name) => {
  try {
    if (!email || !password || !name) return { success: false, error: "Missing fields" };

    // Check if user exists
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return { success: false, error: "User already exists" };

    // Create Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save to Database (Now including NAME)
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name, // <--- Saving the name properly now
      uid: user.uid,
      balance: 0,
      createdAt: new Date(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, error: error.message };
  }
};

// ... (Keep loginUser, logoutUser, etc. the same as before)
export const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getCurrentUser = () => {
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