import { useState, useEffect } from 'react'
import { fetchContracts } from './services/firebase'
import './index.css' 
import { calculateDebt } from './utils/gameLogic'

function App() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)

  // Load Data on Start
  useEffect(() => {
    async function loadData() {
      const data = await fetchContracts();
      
      // Sort by debt (highest first)
      const sorted = data.sort((a, b) => {
         const debtA = calculateDebt(a).totalDebt;
         const debtB = calculateDebt(b).totalDebt;
         return debtB - debtA;
      });

      setContracts(sorted);
      setLoading(false);
    }
    loadData();
  }, [])

  return (
    <div className="app-container">
      <h1 style={{textAlign: 'center', color: '#ffd700'}}>HAKOWARE v2</h1>
      
      {loading ? (
        <div style={{color: 'white', textAlign: 'center'}}>Summoning Database...</div>
      ) : (
        <div className="grid-container">
          {contracts.map(c => {
             const stats = calculateDebt(c);
             return (
                <div key={c.id} style={{
                    background: '#1e1e1e', 
                    padding: '20px', 
                    margin: '10px', 
                    borderLeft: '4px solid #00e676',
                    color: 'white'
                }}>
                  <h3>{c.name}</h3>
                  <h2 style={{color: '#ffd700'}}>{stats.totalDebt} APR</h2>
                </div>
             )
          })}
        </div>
      )}
    </div>
  )
}

export default App
