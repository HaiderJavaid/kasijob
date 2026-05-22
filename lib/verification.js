import { deleteField, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getEmailVerificationFields = (authUser, existingUser = {}) => {
  const isVerified = Boolean(authUser?.emailVerified);

  const fields = {
    emailVerified: isVerified,
    verificationStatus: isVerified ? "email_verified" : "unverified",
  };

  if (isVerified && !existingUser.emailVerifiedAt) {
    fields.emailVerifiedAt = serverTimestamp();
  }

  if (!isVerified && existingUser.emailVerifiedAt) {
    fields.emailVerifiedAt = deleteField();
  }

  return fields;
};

export const syncEmailVerification = async (authUser) => {
  if (!authUser?.uid || !db) {
    return { success: false, verified: false, error: "Missing authenticated user" };
  }

  try {
    const userRef = doc(db, "users", authUser.uid);
    const userSnap = await getDoc(userRef);
    const existingUser = userSnap.exists() ? userSnap.data() : {};
    const fields = getEmailVerificationFields(authUser, existingUser);

    await setDoc(userRef, fields, { merge: true });

    return { success: true, verified: Boolean(authUser.emailVerified), fields };
  } catch (error) {
    console.error("Email verification sync failed:", error);
    return { success: false, verified: Boolean(authUser.emailVerified), error: error.message };
  }
};
