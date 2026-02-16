import { db } from "./firebase";
import { collection, doc, getDocs, updateDoc, query, where, runTransaction, increment, serverTimestamp } from "firebase/firestore";

// --- CONFIG: YOUR FOUNDERS ---
const LEADER_EMAILS =  [
    "muhd.haider111@gmail.com", 
    "nikrash@gmail.com", 
    "haziqnik13@gmail.com", 
    "hakimnik12@gmail.com"
];

// 1. Generate Random Code (e.g., "K9X2A1")
export const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

// 2. Process Referral (THE LOGIC YOU ASKED FOR)
export const processReferral = async (newUserId, referralCodeInput) => {
    if (!referralCodeInput) return { success: false }; 

    try {
        await runTransaction(db, async (transaction) => {
            // A. Find Direct Referrer
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("referralCode", "==", referralCodeInput));
            const snapshot = await getDocs(q);

            if (snapshot.empty) throw "Invalid Code";
            
            const referrerDoc = snapshot.docs[0];
            const referrerData = referrerDoc.data();
            const referrerId = referrerDoc.id;

            if (referrerId === newUserId) throw "Cannot refer self";

            // --- LOGIC START ---
            
            const isDirectReferrerLeader = LEADER_EMAILS.includes(referrerData.email) || referrerData.role === 'leader';
            
            // 1. PAY DIRECT REFERRER
            // Rule: Leaders get 0.50, Regular users get 2.00
            const directReward = isDirectReferrerLeader ? 0.50 : 2.00;

            transaction.update(referrerDoc.ref, { 
                balance: increment(directReward),
                referralCount: increment(1)
            });

            // Create Transaction Receipt for Direct Referrer
            const transRef1 = doc(collection(db, "transactions"));
            transaction.set(transRef1, {
                userId: referrerId,
                userName: referrerData.name || referrerData.email,
                userEmail: referrerData.email,
                amount: directReward,
                type: "credit",
                source: "referral_reward",
                description: isDirectReferrerLeader 
                    ? "Leader Direct Referral (Live)" 
                    : "Direct Referral Bonus",
                createdAt: serverTimestamp(),
                dateString: new Date().toISOString().split('T')[0]
            });

            // 2. CHECK INDIRECT UPLINE (If Direct Referrer was NOT a leader)
            // If User A (Regular) invited New User, User A gets RM 2. 
            // We must check if User A has a Leader above them to pay the RM 0.50 override.
            if (!isDirectReferrerLeader && referrerData.referredBy) {
                const uplineRef = doc(db, "users", referrerData.referredBy);
                const uplineDoc = await transaction.get(uplineRef);

                if (uplineDoc.exists()) {
                    const uplineData = uplineDoc.data();
                    const isUplineLeader = LEADER_EMAILS.includes(uplineData.email) || uplineData.role === 'leader';

                    if (isUplineLeader) {
                        // Pay the Leader their Passive Income (RM 0.50)
                        transaction.update(uplineRef, {
                            balance: increment(0.50)
                        });

                        // Create Transaction Receipt for Leader
                        const transRef2 = doc(collection(db, "transactions"));
                        transaction.set(transRef2, {
                            userId: uplineDoc.id,
                            userName: uplineData.name || uplineData.email,
                            userEmail: uplineData.email,
                            amount: 0.50,
                            type: "credit",
                            source: "leader_bonus",
                            description: "Indirect Team Bonus (Live)",
                            createdAt: serverTimestamp(),
                            dateString: new Date().toISOString().split('T')[0]
                        });
                    }
                }
            }

            // 3. REWARD NEW USER (+RM2) & LINK THEM
            const newUserRef = doc(db, "users", newUserId);
            transaction.update(newUserRef, { 
                balance: increment(2.00),
                referredBy: referrerId,
                referredByCode: referralCodeInput
            });
            
            // Create Transaction Receipt for New User (Sign Up Bonus)
            const transRef3 = doc(collection(db, "transactions"));
            transaction.set(transRef3, {
                userId: newUserId,
                userName: "New User", // We might not have name yet depending on flow
                userEmail: "New User Email", 
                amount: 2.00,
                type: "credit",
                source: "system_adjustment",
                description: "Sign Up Bonus",
                createdAt: serverTimestamp(),
                dateString: new Date().toISOString().split('T')[0]
            });

        });
        return { success: true };
    } catch (error) {
        console.error("Referral Error:", error);
        return { success: false, error: error.toString() };
    }
};

// ... (Keep backfillReferralCodes, getReferralTree, manualLinkUser, unlinkUser EXACTLY as they were) ...
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