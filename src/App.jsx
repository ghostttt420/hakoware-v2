import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'

// --- RE-ENABLING THESE TWO ---
import AdminPanel from './components/AdminPanel'
import Toast from './components/Toast'

// --- KEEPING MODALS OFF FOR NOW ---
// import SettleModal from './components/Modals/SettleModal'
// import PetitionModal from './components/Modals/PetitionModal'

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [toast, setToast] = useState(null) // State for Toast

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
        console.error(e);
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [])

  // Toast Helper
  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const handlePoke = (name) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log(e));
      showToast(`Poked ${name}!`, "MERCY"); // Testing the Toast
  };

  const handleAction = (type, contract) => {
      alert("Modals are still OFF. Check back soon.");
  };

  return (
    <div className="app-container">
      <h1 className="glitch" data-text="HAKOWARE v2" style={{textAlign:'center', marginBottom:'20px'}}>HAKOWARE v2</h1>
      
      {!loading && <Dashboard contracts={contracts} />}
      
      {/* TEST: IS ADMIN PANEL WORKING? */}
      {isAdmin && <AdminPanel onRefresh={loadData} />}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Connecting to Nen Network...</div>
      ) : (
        <div className="grid-container">
          {contracts.map((c, index) => (
             <NenCard 
                key={c.id} contract={c} index={index} isAdmin={isAdmin}
                onAction={handleAction} onPoke={handlePoke}
             />
          ))}
        </div>
      )}

      {/* TEST: IS TOAST WORKING? */}
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
