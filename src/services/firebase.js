import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, addDoc, 
  updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// ... Keep your firebaseConfig here ...
const firebaseConfig = {
  apiKey: "AIzaSyAtxWdL4TVqgPmQJFd_UcPcDMm7_QbGBWw", 
  authDomain: "hakoware-v2.firebaseapp.com",
  projectId: "hakoware-v2",
  storageBucket: "hakoware-v2.firebasestorage.app",
  messagingSenderId: "148408336306",
  appId: "1:148408336306:web:6e10080644365737d0460c"
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

// FIX: Renamed to 'createContract' to match AdminPanel
// FIX: Accepts 'data' object to handle the new email timestamps
export const createContract = async (data) => {
    try {
        await addDoc(collection(db, "friends"), {
            name: data.name,
            email: data.email || "",
            baseDebt: Number(data.baseDebt) || 0,
            limit: Number(data.limit) || 50,
            lastSpoke: data.lastSpoke || new Date().toISOString(),
            // This is the key part for avoiding duplicates:
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
