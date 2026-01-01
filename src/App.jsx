import { useState, useEffect, useRef } from 'react'
import { fetchContracts } from './services/firebase'
import './index.css' 
import { calculateDebt } from './utils/gameLogic'
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'
import AdminPanel from './components/AdminPanel'

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Audio Refs
  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  // 1. Check Admin Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  // 2. Data Loader Function
  const loadData = async () => {
    setLoading(true);
    const data = await fetchContracts();
    // Sort: Highest debt first
    const sorted = data.sort((a, b) => {
       return calculateDebt(b).totalDebt - calculateDebt(a).totalDebt;
    });
    setContracts(sorted);
    setLoading(false);
  };

  // Run Loader on Mount
  useEffect(() => {
    loadData();
  }, [])

  // 3. Handlers
  const handlePoke = (name, isBankrupt) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio blocked", e));
      console.log(`Poked ${name}!`);
  };

  const handleAction = (type, contract) => {
      if (type === 'MERCY') {
          alert(`Opening Mercy Modal for ${contract.name}`);
      } else if (type === 'RESET') {
          alert(`Opening Admin Reset for ${contract.name}`);
      }
  };

  return (
    <div className="app-container">
      <h1 className="glitch" style={{textAlign:'center', marginBottom:'20px'}}>HAKOWARE</h1>
      
      {!loading && <Dashboard contracts={contracts} />}
      
      {/* Admin Controls */}
      {isAdmin && <AdminPanel onRefresh={loadData} />}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Connecting to Nen Network...</div>
      ) : (
        <div className="grid-container">
          {/* Empty State Message */}
          {contracts.length === 0 && (
             <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <h2>No Contracts Found</h2>
                <p>The database is connected but empty.</p>
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
    </div>
  )
}

export default App
