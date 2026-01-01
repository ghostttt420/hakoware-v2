import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
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
  // --- STATE MANAGEMENT ---
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // UI State
  const [selectedContract, setSelectedContract] = useState(null)
  const [modalType, setModalType] = useState(null) // 'SETTLE' or 'PETITION'
  const [toast, setToast] = useState(null) // { msg: "Hello", type: "SUCCESS" }

  // Audio Reference
  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    // Check URL for Admin Mode (?mode=admin)
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  // --- 2. DATA LOADING ---
  const loadData = async () => {
    setLoading(true);
    try {
        const data = await fetchContracts();
        // Sort: Highest Debt First
        const sorted = data.sort((a, b) => {
            return calculateDebt(b).totalDebt - calculateDebt(a).totalDebt;
        });
        setContracts(sorted);
        setLoading(false);
    } catch (e) {
        showToast("Database Error: " + e.message, "ERROR");
        setLoading(false);
    }
  };

  // Load on start
  useEffect(() => { loadData(); }, [])

  // --- 3. HELPER FUNCTIONS ---
  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const handlePoke = (name) => {
      // Play Sound
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio Blocked:", e));
  };

  // --- 4. INTERACTION HANDLERS ---
  const handleAction = (type, contract) => {
      setSelectedContract(contract);
      
      // Admin clicks "We Spoke" -> Open SettleModal
      if (type === 'RESET') {
          setModalType('SETTLE');
      }
      // User clicks "Beg Mercy" or "Make Vow" -> Open PetitionModal
      else if (type === 'MERCY' || type === 'SHAME') {
          setModalType('PETITION');
      }
  };

  const closeModal = () => {
      setSelectedContract(null);
      setModalType(null);
  };

  // --- 5. RENDER ---
  return (
    <div className="app-container">
      {/* HEADER */}
      <h1 className="glitch" data-text="HAKOWARE v2" style={{textAlign:'center', marginBottom:'20px'}}>
          HAKOWARE v2
      </h1>
      
      {/* DASHBOARD (Ticker & Total) */}
      {!loading && <Dashboard contracts={contracts} />}
      
      {/* ADMIN PANEL (Only if ?mode=admin) */}
      {isAdmin && <AdminPanel onRefresh={loadData} />}

      {/* LOADING STATE */}
      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'Courier New'}}>
            Connecting to Nen Network...
        </div>
      ) : (
        /* MAIN GRID */
        <div className="grid-container">
          {contracts.length === 0 && (
             <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <h2>No Contracts Found</h2>
                {isAdmin && <p>Use the panel above to add your first friend.</p>}
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

      {/* --- MODALS --- */}
      
      {/* Admin Settle Modal */}
      <SettleModal 
          isOpen={modalType === 'SETTLE'} 
          contract={selectedContract} 
          onClose={closeModal} 
          onRefresh={loadData}
          showToast={showToast} 
      />
      
      {/* Public Petition/Image Modal */}
      <PetitionModal 
          isOpen={modalType === 'PETITION'} 
          contract={selectedContract} 
          onClose={closeModal}
          showToast={showToast}
      />

      {/* --- TOAST NOTIFICATIONS --- */}
      {toast && (
          <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
      )}
    </div>
  )
}

export default App
