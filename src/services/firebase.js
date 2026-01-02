import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// --- YOUR REAL KEYS (DO NOT DELETE) ---
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

// --- FETCH CONTRACTS ---
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

// --- THE FIX: OBJECT HANDLER ---
// We changed this to accept ONE argument (the data object)
// instead of 5 separate arguments. This matches your Admin Panel.
export const createContract = async (contractData) => {
    try {
        console.log("🔥 SAVING CONTRACT:", contractData);

        await addDoc(collection(db, "friends"), {
            // We unpack the 'Box' here:
            name: contractData.name,
            email: contractData.email || "",
            baseDebt: 0,
            
            // CRITICAL: We grab the limit from inside the box.
            // If contractData.limit is 500, this writes 500.
            limit: Number(contractData.limit) || 50, 
            
            lastSpoke: contractData.lastSpoke || new Date().toISOString(),
            lastBankruptcyEmail: contractData.lastBankruptcyEmail || null
        });
    } catch (e) {
        console.error("Error adding contract: ", e);
    }
};

// --- UPDATE DEBT ---
export const updateContract = async (id, currentTotalDebt, resetTimer = false) => {
    const ref = doc(db, "friends", id);
    const updates = { baseDebt: currentTotalDebt };
    if (resetTimer) updates.lastSpoke = new Date().toISOString();
    await updateDoc(ref, updates);
};

// --- MARK NOTIFIED ---
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

// --- DELETE CONTRACT ---
export const deleteContract = async (id) => {
    await deleteDoc(doc(db, "friends", id));
};
