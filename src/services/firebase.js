import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    Timestamp 
} from "firebase/firestore";

// --- PASTE YOUR CONFIG FROM v1.0 HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyAtxWdL4TVqgPmQJFd_UcPcDMm7_QbGBWw",
    authDomain: "hakoware-92809.firebaseapp.com",
    projectId: "hakoware-92809",
    storageBucket: "hakoware-92809.firebasestorage.app",
    messagingSenderId: "161827009254",
    appId: "1:161827009254:web:84302cd63650563a50c127"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- HELPER FUNCTIONS ---

export const fetchContracts = async () => {
    try {
        // CHANGED: "contracts" -> "friends"
        const querySnapshot = await getDocs(collection(db, "friends"));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (e) {
        // Show alert so you know if it fails on mobile
        alert("DATABASE ERROR: " + e.message);
        console.error("Error fetching documents: ", e);
        return [];
    }
};

export const createContract = async (name, dateStr, limit, email) => {
    try {
        // CHANGED: "contracts" -> "friends"
        await addDoc(collection(db, "friends"), {
            name: name,
            email: email || "",
            baseDebt: 0,
            bankruptcyLimit: parseInt(limit) || 50,
            // Safe Date Handling
            lastInteraction: Timestamp.fromDate(dateStr ? new Date(dateStr) : new Date()),
            bankruptcyNotified: false
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e; // Throw so UI knows it failed
    }
};

export const updateContract = async (id, currentDebt, resetTimer) => {
    try {
        // CHANGED: "contracts" -> "friends"
        const ref = doc(db, "friends", id);
        const updates = { baseDebt: currentDebt };
        
        if (resetTimer) {
            updates.lastInteraction = Timestamp.now();
            updates.bankruptcyNotified = false; 
        }
        
        await updateDoc(ref, updates);
    } catch (e) {
        console.error("Error updating: ", e);
        throw e;
    }
};

export const deleteContract = async (id) => {
    try {
        // CHANGED: "contracts" -> "friends"
        await deleteDoc(doc(db, "friends", id));
    } catch (e) {
        console.error("Error deleting: ", e);
        throw e;
    }
};



// UPDATED: Saves the current timestamp instead of just a boolean
export const markBankruptcyNotified = async (id) => {
    try {
        const contractRef = doc(db, "friends", id);
        await updateDoc(contractRef, {
            // We save the EXACT TIME we sent the email
            lastBankruptcyEmail: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error updating notification status: ", e);
    }
};

