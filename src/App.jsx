import { useState, useEffect, useRef } from 'react';
import { fetchContracts, markBankruptcyNotified, processPayment } from './services/firebase';
import { sendSystemEmail } from './services/emailService';
import { getRandomQuote } from './utils/quotes'; 
import { calculateDebt } from './utils/gameLogic';
import './index.css'; 

// COMPONENTS
import Dashboard from './components/Dashboard';
import NenCard from './components/NenCard';
import AdminPanel from './components/AdminPanel';
import AdminLock from './components/AdminLock';
import Toast from './components/Toast';
import PaymentModal from './components/Modals/PaymentModal'; // V3 Modal
import PetitionModal from './components/Modals/PetitionModal';

function App() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [myIdentity, setMyIdentity] = useState(localStorage.getItem('hakoware_id'));

  // --- UI STATE ---
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalType, setModalType] = useState(null); 
  const [toast, setToast] = useState(null);
  const [recentActivity, setRecentActivity] = useState("SYSTEM: MONITORING TRANSACTIONS...");

  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  // --- INITIALIZATION ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  // --- DATA LOADING & PROTOCOLS ---
  const loadData = async () => {
    setLoading(true);
    try {
        const data = await fetchContracts();
        
        // --- 1. BANKRUPTCY PROTOCOL (V2 LOGIC RESTORED) ---
        // Only Admin triggers this check to prevent user clients from spamming DB
        if (isAdmin) {
            const now = new Date();
            
            const targets = data.filter(c => {
                const stats = calculateDebt(c);
                const isBankrupt = stats.totalDebt >= stats.limit;

                if (!isBankrupt) return false;

                // LOGIC: Check time since last email
                if (!c.lastBankruptcyEmail) {
                    return true; // Never sent? Send now.
                }

                // Check 10 Day Timer
                const lastSentDate = new Date(c.lastBankruptcyEmail);
                const diffTime = Math.abs(now - lastSentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                return diffDays >= 10; // Only send if 10+ days passed
            });

            // Process Targets
            for (const c of targets) {
                const stats = calculateDebt(c);
                console.log(`[PROTOCOL] Sending recurring notice to ${c.name}...`);
                
                await sendSystemEmail('BANKRUPTCY', { 
                    name: c.name, 
                    email: c.email, 
                    debt: stats.totalDebt 
                }, showToast, true);
                
                // Mark DB so we don't send again for 10 days
                await markBankruptcyNotified(c.id);
            }
        }
        // ------------------------------------------

        // Sort by Debt (High to Low)
        const sorted = data.sort((a, b) => calculateDebt(b).totalDebt - calculateDebt(a).totalDebt);
        setContracts(sorted);
        setLoading(false);

    } catch (e) {
        console.error(e);
        showToast("Sync Failed", "ERROR");
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [isAdmin]);

  // --- INTERACTION HANDLERS ---

  const handlePoke = (name, isBankrupt, isClean) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio Blocked:", e));
      
      const msg = getRandomQuote(isBankrupt, isClean);
      const type = isBankrupt ? "ERROR" : isClean ? "SUCCESS" : "INFO";
      
      showToast(msg, type);
  };

  const handleAction = (type, contract) => {
      // Security: Admin Lock
      if (isAdmin && !adminUnlocked) {
          showToast("🔒 SYSTEM LOCKED: ENTER PIN", "ERROR");
          return;
      }
      // Security: Identity Lock
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
      // V3 LOGIC: 'RESET' opens Payment Modal (Admin Only)
      if (type === 'RESET' || type === 'PAY') setModalType('PAYMENT');
      else if (type === 'MERCY' || type === 'SHAME') setModalType('PETITION');
  };

  // --- V3 PAYMENT HANDLER (THE EMAIL LOGIC) ---
  const handlePaymentExecution = async (contract, amount, isPaid) => {
      // 1. Snapshot Stats BEFORE update
      const currentStats = calculateDebt(contract);
      const currentDebt = currentStats.totalDebt;
      
      if (isPaid) {
          showToast("Processing Transaction...", "INFO");
          await processPayment(contract.id, amount); // Update DB
          
          // Determine Email Type (Partial vs Clear)
          const remaining = currentDebt - amount;

          if (remaining <= 0) {
              // SCENARIO: FULLY CLEARED
              sendSystemEmail('CLEARED', {
                  name: contract.name,
                  email: contract.email,
                  debt: currentDebt,      
                  amountPaid: amount      
              }, showToast, true);
              setRecentActivity(`💎 DEBT CLEARED: ${contract.name} is free.`);
              showToast(`💰 ACCOUNT SETTLED`, "SUCCESS");
          } else {
              // SCENARIO: RESTORATION (Receipt)
              sendSystemEmail('RECEIPT', {
                  name: contract.name,
                  email: contract.email,
                  debt: currentDebt,
                  amountPaid: amount
              }, showToast, true);
              setRecentActivity(`💸 DEPOSIT VERIFIED: ${contract.name} paid ${amount} Aura`);
              showToast(`💰 RECEIVED: ${amount} Aura`, "SUCCESS");
          }

      } else {
          // SCENARIO: WE SPOKE (RESET)
          await processPayment(contract.id, 0); 
          
          sendSystemEmail('RESET', {
              name: contract.name,
              email: contract.email,
              debt: currentDebt 
          }, showToast, true);

          setRecentActivity(`🗣️ INTERACTION LOGGED: ${contract.name}`);
          showToast("🗣️ Timer Reset.", "INFO");
      }
      
      closeModal();
      loadData(); // Refresh UI
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
      {/* HEADER */}
      <header style={{textAlign: 'center', marginBottom: '30px', marginTop: '10px'}}>
          <h1 className="glitch" data-text="HAKOWARE" style={{marginBottom: '5px', lineHeight: '1'}}>
              HAKOWARE 
          </h1>
          <div className="sub-header">
              CHAPTER 7 BANKRUPTCY
          </div>
      </header>
      
      {!loading && <Dashboard contracts={contracts} recentActivity={recentActivity} />}
      
      {/* --- ADMIN CONTROLS --- */}
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

      {/* --- CARD GRID --- */}
      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'Courier New'}}>
            Connecting to Nen Network...
        </div>
      ) : (
        <div className="grid-container">
          {contracts.map((c, index) => {
             const isMine = myIdentity === c.id;
             const isDisabled = !isAdmin && myIdentity && !isMine;
             
             return (
               <div key={c.id} style={{opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto'}}>
                 <NenCard 
                    contract={c} 
                    index={index} 
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
      {/* V3 PAYMENT TERMINAL (Admin Only) */}
      {(isAdmin && adminUnlocked) && (
        <PaymentModal 
            isOpen={modalType === 'PAYMENT'} 
            contract={selectedContract} 
            onClose={closeModal} 
            onPay={handlePaymentExecution} // <--- Links to V3 Logic
            onDelete={async (id) => {
                // Delete Logic handled inside modal or here? Usually here for safety.
                // Assuming PaymentModal calls onDelete(id)
                // You might need to import deleteContract from firebase services if not present in Modal
                await handleRefreshData("CONTRACT TERMINATED");
                closeModal();
            }}
        />
      )}
      
      {/* PETITION MODAL (Everyone) */}
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

export default App;
