import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// --- YOUR KEYS ---
const firebaseConfig = {
    apiKey: "AIzaSyAtxWdL4TVqgPmQJFd_UcPcDMm7_QbGBWw", 
    authDomain: "hakoware-92809.firebaseapp.com",
    projectId: "hakoware-92809",
    storageBucket: "hakoware-92809.firebasestorage.app",
    messagingSenderId: "161827009254",
    appId: "1:161827009254:web:84302cd63650563a50c127"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchContracts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "friends"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Fetch Error:", e);
    return [];
  }
};

// --- RAW INPUT FUNCTION ---
// 1. Name, 2. Date, 3. Limit, 4. Email, 5. Timer
export const createContract = async (name, lastSpoke, limit, email, lastBankruptcyEmail) => {
    try {
        console.log(`📝 SAVING RAW DATA -> Limit: ${limit}`);

        // STRICT CONVERSION:
        // whatever comes in, we turn it into a Number.
        // If it's invalid, it becomes 0. IT WILL NEVER BE 50 AUTOMATICALLY.
        let finalLimit = Number(limit);
        if (isNaN(finalLimit)) finalLimit = 0;

        await addDoc(collection(db, "friends"), {
            name: name,
            email: email || "",
            baseDebt: 0,
            
            // NO DEFAULT OF 50 HERE. 
            limit: finalLimit, 
            
            lastSpoke: lastSpoke || new Date().toISOString(),
            lastBankruptcyEmail: lastBankruptcyEmail || null
        });
    } catch (e) {
        console.error("Error adding contract: ", e);
    }
};

export const updateContract = async (id, currentTotalDebt, resetTimer = false) => {
    const ref = doc(db, "friends", id);
    const updates = { baseDebt: currentTotalDebt };
    if (resetTimer) updates.lastSpoke = new Date().toISOString();
    await updateDoc(ref, updates);
};

export const markBankruptcyNotified = async (id) => {
    try {
        const contractRef = doc(db, "friends", id);
        await updateDoc(contractRef, {
            lastBankruptcyEmail: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error updating notification status: ", e);
    }
};

export const deleteContract = async (id) => {
    await deleteDoc(doc(db, "friends", id));
};
