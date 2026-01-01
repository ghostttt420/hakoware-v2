import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'
import AdminPanel from './components/AdminPanel'
import SettleModal from './components/Modals/SettleModal'
import PetitionModal from './components/Modals/PetitionModal'
import Toast from './components/Toast' // <--- IMPORT THIS

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Modal & Toast State
  const [selectedContract, setSelectedContract] = useState(null)
  const [modalType, setModalType] = useState(null) 
  const [toast, setToast] = useState(null); // { msg: "Hello", type: "SUCCESS" }

  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await fetchContracts();
        const sorted = data.sort((a, b) => calculateDebt(b).totalDebt - calculateDebt(a).totalDebt);
        setContracts(sorted);
        setLoading(false);
    } catch (e) {
        showToast("Database Error", "ERROR");
    }
  };

  useEffect(() => { loadData(); }, [])

  // --- TOAST HELPER ---
  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const handlePoke = (name) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log(e));
      // showToast(`Poked ${name}!`, "MERCY"); // Optional: if you want toasters on poke
  };

  const handleAction = (type, contract) => {
      setSelectedContract(contract);
      if (type === 'RESET') setModalType('SETTLE');
      if (type === 'MERCY' || type === 'SHAME') setModalType('PETITION');
  };

  const closeModal = () => {
      setSelectedContract(null);
      setModalType(null);
  };

  return (
    <div className="app-container">
      <h1 className="glitch" data-text="HAKOWARE v2" style={{textAlign:'center', marginBottom:'20px'}}>HAKOWARE v2</h1>
      
      {!loading && <Dashboard contracts={contracts} />}
      
      {isAdmin && <AdminPanel onRefresh={loadData} />}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Connecting to Nen Network...</div>
      ) : (
        <div className="grid-container">
          {contracts.length === 0 && (
             <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <h2>No Contracts Found</h2>
             </div>
          )}

          {contracts.map((c, index) => (
             <NenCard 
                key={c.id} contract={c} index={index} isAdmin={isAdmin}
                onAction={handleAction} onPoke={handlePoke}
             />
          ))}
        </div>
      )}

      {/* --- MODALS (Now with Toast capability) --- */}
      <SettleModal 
          isOpen={modalType === 'SETTLE'} 
          contract={selectedContract} 
          onClose={closeModal} 
          onRefresh={loadData}
          showToast={showToast} 
      />
      
      <PetitionModal 
          isOpen={modalType === 'PETITION'} 
          contract={selectedContract} 
          onClose={closeModal}
          showToast={showToast}
      />

      {/* --- TOAST DISPLAY --- */}
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
