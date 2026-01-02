import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// --- CONFIGURATION ---
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

// --- THE UNIVERSAL CREATE FUNCTION (The Fix) ---
// This works with BOTH the Old Admin Panel AND the New Admin Panel.
export const createContract = async (arg1, arg2, arg3, arg4) => {
    try {
        let data = {};

        // DETECT: Is arg1 a complex object? (New Style)
        if (typeof arg1 === 'object' && arg1 !== null) {
            data = arg1;
        } 
        // DETECT: Is arg1 a string? (Old Style: name, date, limit, email)
        else {
            data = {
                name: arg1,
                lastSpoke: arg2,
                limit: arg3,
                email: arg4
            };
        }

        // LOGGING: Check your console to see exactly what is being saved
        console.log("📝 SAVING CONTRACT:", data);

        await addDoc(collection(db, "friends"), {
            name: data.name,
            email: data.email || "",
            baseDebt: 0, 
            
            // CRITICAL: We ensure 'limit' is read as a Number. 
            // If data.limit is "500", this saves 500. 
            limit: Number(data.limit), 
            
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
