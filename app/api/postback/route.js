import { db } from "@/lib/firebase"; // Ensure this points to your firebase config
import { doc, runTransaction, increment } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request) {
  // 1. Parse the URL parameters from AdGem
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("player_id"); // AdGem sends 'player_id'
  const amount = parseFloat(searchParams.get("amount")); // The reward
  const offerId = searchParams.get("offer_id"); // Unique offer ID
  const ip = searchParams.get("ip"); 

  // 2. Validate
  if (!userId || !amount) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // 3. Update User Balance safely using a Transaction
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        throw "User does not exist";
      }

      // Add money to balance
      transaction.update(userRef, {
        balance: increment(amount)
      });

      // Log the transaction history (Optional but recommended)
      const newTxRef = doc(collection(db, "transactions"));
      transaction.set(newTxRef, {
        userId,
        amount,
        type: "offerwall",
        source: "AdGem",
        offerId,
        date: new Date()
      });
    });

    // 4. Respond "1" or "OK" (AdGem expects a 200 OK)
    return new NextResponse("1", { status: 200 });

  } catch (error) {
    console.error("Postback Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}