import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// --- YOUR REAL CONFIGURATION ---
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

// --- THE PROFESSIONAL FIX: UNIVERSAL HANDLER ---
// This function is now smart enough to handle BOTH formats.
export const createContract = async (arg1, arg2, arg3, arg4, arg5) => {
    try {
        let data = {};

        // DETECTION LOGIC:
        // 1. If arg1 is an Object (The "New" Admin Panel sends this)
        if (typeof arg1 === 'object' && arg1 !== null) {
            data = arg1;
            console.log("✅ Detected OBJECT format");
        } 
        // 2. If arg1 is a String (The "Old" Admin Panel sends this)
        else {
            data = {
                name: arg1,
                lastSpoke: arg2,
                limit: arg3,
                email: arg4,
                lastBankruptcyEmail: arg5
            };
            console.log("✅ Detected LIST format");
        }

        // DEBUGGING: This prints exactly what we are saving
        console.log(`Saving Limit: ${data.limit} (Type: ${typeof data.limit})`);

        await addDoc(collection(db, "friends"), {
            name: data.name,
            email: data.email || "",
            baseDebt: 0,
            
            // FORCE NUMBER: This ensures '3' becomes the number 3.
            // If data.limit is missing, ONLY THEN do we use 50.
            limit: Number(data.limit) || 50, 
            
            lastSpoke: data.lastSpoke || new Date().toISOString(),
            lastBankruptcyEmail: data.lastBankruptcyEmail || null
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
