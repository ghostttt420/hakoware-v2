import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
import { sendSystemEmail } from './services/emailService';
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'
import AdminPanel from './components/AdminPanel'
import Toast from './components/Toast'

// Modals
import SettleModal from './components/Modals/SettleModal'
import PetitionModal from './components/Modals/PetitionModal'

function App() {
  // --- STATE ---
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // UI State
  const [selectedContract, setSelectedContract] = useState(null)
  const [modalType, setModalType] = useState(null) 
  const [toast, setToast] = useState(null)
  
  // NEW: Live Ticker State
  const [recentActivity, setRecentActivity] = useState("SYSTEM: MONITORING TRANSACTIONS...");

  // Audio
  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await fetchContracts();
if (isAdmin) {
    data.forEach(async (c) => {
        const stats = calculateDebt(c);
        const isBankrupt = stats.totalDebt >= stats.limit;

        if (isBankrupt && !c.bankruptcyNotified) {
            
            // --- NEW CALL: Pass showToast and isAdmin (true) ---
            sendSystemEmail('BANKRUPTCY', { ...c, ...stats }, showToast, true);
            
            await markBankruptcyNotified(c.id);
        }
    });
}
        const sorted = data.sort((a, b) => calculateDebt(b).totalDebt - calculateDebt(a).totalDebt);
        setContracts(sorted);
        setLoading(false);
    } catch (e) {
        showToast("Database Error", "ERROR");
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [])

  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const handlePoke = (name, isBankrupt, isClean) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio Blocked:", e));
      
      let msg = "🧚 POTCLEAN: Interest is compounding...";
      let type = "INFO";

      if (isBankrupt) {
          msg = "👹 TORITATEN: Pay up or perish!";
          type = "ERROR";
      } else if (isClean) {
          msg = "💎 SYSTEM: This user is untouchable.";
          type = "SUCCESS";
      }
      showToast(msg, type);
  };

  const handleAction = (type, contract) => {
      setSelectedContract(contract);
      if (type === 'RESET') setModalType('SETTLE');
      else if (type === 'MERCY' || type === 'SHAME') setModalType('PETITION');
  };

  // --- NEW: Callback when Admin/User finishes an action
  const handleRefreshData = (actionMsg) => {
      if(actionMsg) setRecentActivity(actionMsg); // Update the ticker
      loadData(); // Reload DB
  };

  const closeModal = () => {
      setSelectedContract(null);
      setModalType(null);
  };

  return (
    <div className="app-container">
      <h1 className="glitch" data-text="HAKOWARE v2" style={{textAlign:'center', marginBottom:'20px'}}>
          HAKOWARE v2
      </h1>
      
      {/* PASS RECENT ACTIVITY TO DASHBOARD */}
      {!loading && <Dashboard contracts={contracts} recentActivity={recentActivity} />}
      
      {isAdmin && <AdminPanel onRefresh={() => handleRefreshData("SYSTEM: NEW CONTRACT ISSUED")} />}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'Courier New'}}>
            Connecting to Nen Network...
        </div>
      ) : (
        <div className="grid-container">
          {contracts.length === 0 && (
             <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <h2>No Contracts Found</h2>
             </div>
          )}
          {contracts.map((c, index) => (
             <NenCard 
                key={c.id} 
                contract={c} 
                index={index} 
                isAdmin={isAdmin}
                onAction={handleAction} 
                onPoke={handlePoke}
             />
          ))}
        </div>
      )}

      {/* Modals with Activity Callbacks */}
      <SettleModal 
          isOpen={modalType === 'SETTLE'} 
          contract={selectedContract} 
          onClose={closeModal} 
          onRefresh={handleRefreshData} // Pass the new handler
          showToast={showToast} 
      />
      
      <PetitionModal 
          isOpen={modalType === 'PETITION'} 
          contract={selectedContract} 
          onClose={closeModal}
          showToast={showToast}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App
