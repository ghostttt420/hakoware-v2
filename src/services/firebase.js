import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// REPLACE WITH YOUR KEYS
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
  const querySnapshot = await getDocs(collection(db, "friends"));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// --- THIS IS THE FIX ---
// Accepts an OBJECT now, so it knows which value is the Limit and which is the Name
export const createContract = async (data) => {
    try {
        await addDoc(collection(db, "friends"), {
            name: data.name,
            email: data.email || "",
            baseDebt: Number(data.baseDebt) || 0,
            
            // This reads the correct Limit you typed
            limit: Number(data.limit) || 50, 
            
            lastSpoke: data.lastSpoke || new Date().toISOString(),
            lastBankruptcyEmail: data.lastBankruptcyEmail || null
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
