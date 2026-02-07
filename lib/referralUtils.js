import { db } from "./firebase";
import { collection, doc, getDocs, updateDoc, query, where, runTransaction, increment } from "firebase/firestore";

// 1. Generate Random Code (e.g., "K9X2A1")
export const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

// 2. Process Referral (Runs ONLY on New Registration)
// Rewards: RM2 for New User, RM2 for Referrer
export const processReferral = async (newUserId, referralCodeInput) => {
    if (!referralCodeInput) return { success: false }; // No code, no problem

    try {
        await runTransaction(db, async (transaction) => {
            // Find Referrer
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("referralCode", "==", referralCodeInput));
            const snapshot = await getDocs(q);

            if (snapshot.empty) throw "Invalid Code"; // User typed wrong code
            const referrerDoc = snapshot.docs[0];
            const referrerId = referrerDoc.id;

            if (referrerId === newUserId) throw "Cannot refer self";

            // A. Reward Referrer (+RM2)
            transaction.update(referrerDoc.ref, { 
                balance: increment(2.00),
                referralCount: increment(1)
            });

            // B. Reward New User (+RM2) & Link them
            const newUserRef = doc(db, "users", newUserId);
            transaction.update(newUserRef, { 
                balance: increment(2.00),
                referredBy: referrerId,
                referredByCode: referralCodeInput
            });
        });
        return { success: true };
    } catch (error) {
        console.error("Referral Error:", error);
        return { success: false, error: error.toString() };
    }
};

// 3. Admin: Backfill Missing Codes
export const backfillReferralCodes = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    let count = 0;
    const promises = snapshot.docs.map(async (d) => {
        if (!d.data().referralCode) {
            await updateDoc(d.ref, { referralCode: generateReferralCode() });
            count++;
        }
    });
    await Promise.all(promises);
    return count;
};

// 4. Admin: Get Tree Data
export const getReferralTree = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data(), children: [] }));
    const userMap = {};
    users.forEach(u => userMap[u.id] = u);
    
    const rootUsers = [];
    users.forEach(u => {
        if (u.referredBy && userMap[u.referredBy]) {
            userMap[u.referredBy].children.push(u);
        } else {
            rootUsers.push(u);
        }
    });
    return rootUsers; // Only returns top-level users (Founders)
};

// 5. Admin: Manual Link (Fix Hierarchy)
export const manualLinkUser = async (childEmail, parentCode) => {
    try {
        const usersRef = collection(db, "users");
        
        // Find Child
        const childQ = query(usersRef, where("email", "==", childEmail));
        const childSnap = await getDocs(childQ);
        if (childSnap.empty) throw "Child email not found";
        const childDoc = childSnap.docs[0];

        // Find Parent
        const parentQ = query(usersRef, where("referralCode", "==", parentCode));
        const parentSnap = await getDocs(parentQ);
        if (parentSnap.empty) throw "Parent code not found";
        const parentDoc = parentSnap.docs[0];

        if (childDoc.id === parentDoc.id) throw "Cannot link to self";

        // Link them (No rewards for manual fix, just tree structure)
        await updateDoc(childDoc.ref, {
            referredBy: parentDoc.id,
            referredByCode: parentCode
        });

        return { success: true };
    } catch (e) {
        return { success: false, error: e.toString() };
        
    }
};

// 6. Admin: Unlink User (Make them a Root Parent)
export const unlinkUser = async (userEmail) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const snap = await getDocs(q);
        
        if (snap.empty) throw "User not found";
        const userDoc = snap.docs[0];

        await updateDoc(userDoc.ref, {
            referredBy: null,
            referredByCode: null
        });

        return { success: true };
    } catch (e) {
        return { success: false, error: e.toString() };
    }
};