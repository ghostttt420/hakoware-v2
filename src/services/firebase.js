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
        const querySnapshot = await getDocs(collection(db, "contracts"));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (e) {
        console.error("Error fetching documents: ", e);
        return [];
    }
};

export const createContract = async (name, dateStr, limit, email) => {
    try {
        await addDoc(collection(db, "contracts"), {
            name: name,
            email: email || "",
            baseDebt: 0,
            bankruptcyLimit: parseInt(limit) || 50,
            lastInteraction: Timestamp.fromDate(new Date(dateStr)),
            bankruptcyNotified: false
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const updateContract = async (id, currentDebt, resetTimer) => {
    const ref = doc(db, "contracts", id);
    const updates = { baseDebt: currentDebt };
    
    if (resetTimer) {
        updates.lastInteraction = Timestamp.now();
        updates.bankruptcyNotified = false; // Reset the email flag
    }
    
    await updateDoc(ref, updates);
};

export const deleteContract = async (id) => {
    await deleteDoc(doc(db, "contracts", id));
};
