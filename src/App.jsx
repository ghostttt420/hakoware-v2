import { useState, useEffect, useRef } from 'react'
import { fetchContracts, markBankruptcyNotified } from './services/firebase'
import { sendSystemEmail } from './services/emailService'
import { getRandomQuote } from './utils/quotes' 
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'
import AdminPanel from './components/AdminPanel'
import AdminLock from './components/AdminLock'
import Toast from './components/Toast'
import SettleModal from './components/Modals/SettleModal'
import PetitionModal from './components/Modals/PetitionModal'

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUnlocked, setAdminUnlocked] = useState(false) // Must be TRUE to see controls
  const [myIdentity, setMyIdentity] = useState(localStorage.getItem('hakoware_id'));

  // --- UI STATE ---
  const [selectedContract, setSelectedContract] = useState(null)
  const [modalType, setModalType] = useState(null) 
  const [toast, setToast] = useState(null)
  const [recentActivity, setRecentActivity] = useState("SYSTEM: MONITORING TRANSACTIONS...");

  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await fetchContracts();
        
        // Auto-Email Logic (Runs in background if Admin Mode is active, regardless of lock)
        if (isAdmin) {
            data.forEach(async (c) => {
                const stats = calculateDebt(c);
                const isBankrupt = stats.totalDebt >= stats.limit;
                if (isBankrupt && !c.bankruptcyNotified) {
                    sendSystemEmail('BANKRUPTCY', { ...c, ...stats }, showToast, true);
                    await markBankruptcyNotified(c.id);
                }
            });
        }

        const sorted = data.sort((a, b) => calculateDebt(b).totalDebt - calculateDebt(a).totalDebt);
        setContracts(sorted);
        setLoading(false);
    } catch (e) {
        console.error(e);
        showToast("Database Error", "ERROR");
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [isAdmin]) 

  // --- HANDLERS ---

  const handlePoke = (name, isBankrupt, isClean) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio Blocked:", e));
      
      const msg = getRandomQuote(isBankrupt, isClean);
      const type = isBankrupt ? "ERROR" : isClean ? "SUCCESS" : "INFO";
      
      showToast(msg, type);
  };

  const handleAction = (type, contract) => {
      // 1. SECURITY CHECK: If Admin is present but locked, BLOCK EVERYTHING
      if (isAdmin && !adminUnlocked) {
          showToast("🔒 SYSTEM LOCKED: ENTER PIN", "ERROR");
          return;
      }

      // 2. IDENTITY CHECK: If User (Not Admin), enforce "My Card Only"
      if (!isAdmin) {
          if (!myIdentity) {
              if (confirm(`Are you ${contract.name}? You can only manage this card from now on.`)) {
                  localStorage.setItem('hakoware_id', contract.id);
                  setMyIdentity(contract.id);
              } else {
                  return; 
              }
          } else if (myIdentity !== contract.id) {
              showToast("ACCESS DENIED: Not your card.", "ERROR");
              return;
          }
      }

      setSelectedContract(contract);
      if (type === 'RESET') setModalType('SETTLE');
      else if (type === 'MERCY' || type === 'SHAME') setModalType('PETITION');
  };

  const handleRefreshData = (actionMsg) => {
      if(actionMsg) setRecentActivity(actionMsg); 
      loadData(); 
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
      
      {!loading && <Dashboard contracts={contracts} recentActivity={recentActivity} />}
      
      {/* --- ADMIN LOCK SYSTEM --- */}
      {/* If Admin Mode, show Lock. Only show Panel if Unlocked. */}
      {isAdmin && (
          !adminUnlocked ? (
              <AdminLock onUnlock={() => {
                  setAdminUnlocked(true);
                  showToast("ADMIN PRIVILEGES GRANTED", "SUCCESS");
              }} />
          ) : (
              <AdminPanel onRefresh={() => handleRefreshData("SYSTEM: NEW CONTRACT ISSUED")} />
          )
      )}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'Courier New'}}>
            Connecting to Nen Network...
        </div>
      ) : (
        <div className="grid-container">
          {contracts.map((c, index) => {
             // User Interaction Rules
             const isMine = myIdentity === c.id;
             const isDisabled = !isAdmin && myIdentity && !isMine;
             
             return (
               <div key={c.id} style={{opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto'}}>
                 <NenCard 
                    contract={c} 
                    index={index} 
                    // SECURITY FIX: Only pass 'true' if actually unlocked
                    isAdmin={isAdmin && adminUnlocked}
                    onAction={handleAction} 
                    onPoke={handlePoke}
                 />
               </div>
             );
          })}
        </div>
      )}

      {!isAdmin && myIdentity && (
          <div style={{textAlign:'center', marginTop:'30px', opacity:0.5}}>
              <button onClick={() => {
                  localStorage.removeItem('hakoware_id');
                  setMyIdentity(null);
                  window.location.reload();
              }} style={{background:'none', border:'none', color:'#444', textDecoration:'underline'}}>
                  Not you? Reset Identity
              </button>
          </div>
      )}

      {/* --- MODALS --- */}
      {/* We only render SettleModal (Admin Tools) if actually unlocked */}
      {(isAdmin && adminUnlocked) && (
        <SettleModal 
            isOpen={modalType === 'SETTLE'} 
            contract={selectedContract} 
            onClose={closeModal} 
            onRefresh={handleRefreshData} 
            showToast={showToast} 
        />
      )}
      
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
