import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// --- CONFIGURATION (PUT YOUR REAL KEYS BACK HERE) ---
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

// --- THE FIX: UNIVERSAL CREATE FUNCTION ---
export const createContract = async (arg1) => {
    try {
        // We force 'data' to be the object passed from AdminPanel
        const data = arg1;

        await addDoc(collection(db, "friends"), {
            name: data.name,
            email: data.email || "",
            baseDebt: 0, // Debt is calculated by time, so base is 0
            
            // FIX: Explicitly grab the limit, or crash if missing (no more default 50 hiding bugs)
            limit: Number(data.limit), 
            
            lastSpoke: data.lastSpoke || new Date().toISOString(),
            lastBankruptcyEmail: data.lastBankruptcyEmail || null
        });
        console.log("Contract Created. Limit set to:", data.limit);
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
