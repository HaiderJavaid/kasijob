import { db } from "./firebase";
import { collection, getDocs, runTransaction, doc, serverTimestamp, query, where, addDoc } from "firebase/firestore";

// Helper: Recursive count for Leaders
const countTotalDownline = (userId, allUsers) => {
    const directChildren = allUsers.filter(u => u.referredBy === userId);
    let count = directChildren.length;
    directChildren.forEach(child => {
        count += countTotalDownline(child.id, allUsers);
    });
    return count;
};

export const generateRetroactiveRewards = async () => {
    // 1. Fetch ALL users
    const usersSnap = await getDocs(collection(db, "users"));
    const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // 2. Define Leaders (You can edit this list or add 'isLeader: true' in Firebase)
    // Replace these emails with your 4 founders' emails
    const LEADER_EMAILS = ["muhd.haider111@gmail.com", "nikrash@gmail.com", "haziqnik13@gmail.com", "hakimnik12@gmail.com"];

    let results = { updated: 0, totalPaid: 0 };

    // 3. Run Payouts
    // Note: We use a loop of transactions because batch has a 500 limit.
    for (const user of allUsers) {
        let rewardAmount = 0;
        let rewardType = "";

        // CHECK: Is this a TOP LEADER?
        if (LEADER_EMAILS.includes(user.email) || user.role === 'leader') {
            const totalCount = countTotalDownline(user.id, allUsers);
            if (totalCount > 0) {
                rewardAmount = totalCount * 0.50;
                rewardType = `Leader Bonus (${totalCount} Downline)`;
            }
        } 
        // CHECK: Regular User (Direct Invites Only)
        else {
            const directInvites = allUsers.filter(u => u.referredBy === user.id).length;
            if (directInvites > 0) {
                rewardAmount = directInvites * 2.00;
                rewardType = `Referral Bonus (${directInvites} Invites)`;
            }
        }

        // 4. If they deserve money, Pay them & Record Transaction
        if (rewardAmount > 0) {
            try {
                await runTransaction(db, async (t) => {
                    const userRef = doc(db, "users", user.id);
                    const userDoc = await t.get(userRef);
                    if (!userDoc.exists()) return;

                    // A. Update Balance
                    const newBalance = (userDoc.data().balance || 0) + rewardAmount;
                    t.update(userRef, { balance: newBalance });

                    // B. Create Transaction Record (Crucial for Admin Page)
                    const transRef = doc(collection(db, "transactions"));
                    t.set(transRef, {
                        userId: user.id,
                        userName: user.name || user.email,
                        userEmail: user.email,
                        amount: rewardAmount,
                        type: "credit", // credit = money in
                        source: "retroactive_reward",
                        description: rewardType,
                        createdAt: serverTimestamp(),
                        dateString: new Date().toISOString().split('T')[0] // For grouping
                    });
                });
                results.updated++;
                results.totalPaid += rewardAmount;
            } catch (e) {
                console.error(`Failed to pay ${user.email}:`, e);
            }
        }
    }

    return results;
};

// Admin: Sync Ledger (Create 'Opening Balance' for existing money)
export const syncBalancesToLedger = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    let count = 0;

    for (const userDoc of usersSnap.docs) {
        const user = userDoc.data();
        const balance = user.balance || 0;

        if (balance > 0) {
            // Check if they already have transactions
            const transQ = query(collection(db, "transactions"), where("userId", "==", userDoc.id));
            const transSnap = await getCountFromServer(transQ); // Requires import { getCountFromServer }
            
            // Only create record if they have NO history but HAVE money
            if (transSnap.data().count === 0) {
                 await addDoc(collection(db, "transactions"), {
                    userId: userDoc.id,
                    userName: user.name || user.email,
                    userEmail: user.email,
                    amount: balance,
                    type: "credit",
                    source: "system_adjustment",
                    description: "Opening Balance Import",
                    createdAt: serverTimestamp(),
                    dateString: new Date().toISOString().split('T')[0]
                });
                count++;
            }
        }
    }
    return count;
};