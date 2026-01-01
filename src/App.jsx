import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'

// --- COMMENTED OUT TO PREVENT CRASH ---
   import AdminPanel from './components/AdminPanel'
   import SettleModal from './components/Modals/SettleModal'
// import PetitionModal from './components/Modals/PetitionModal'
 import Toast from './components/Toast'

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
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

  const handlePoke = (name) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log(e));
  };

  // Simplified Handler (Alerts only for now)
  const handleAction = (type, contract) => {
      alert("Modals are currently disabled for debugging.");
  };

  return (
    <div className="app-container">
      <h1 className="glitch" data-text="HAKOWARE v2" style={{textAlign:'center', marginBottom:'20px'}}>HAKOWARE v2</h1>
      
      {!loading && <Dashboard contracts={contracts} />}
      
      {/* {isAdmin && <AdminPanel onRefresh={loadData} />} */}

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
    </div>
  )
}

export default App
