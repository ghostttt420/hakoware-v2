import { useRef } from 'react';
import CountUp from './CountUp';
import { calculateDebt } from '../utils/gameLogic';

const Dashboard = ({ contracts, recentActivity }) => {
  // Switched to a standard MP3 that usually loads faster
  const sfxCoin = useRef(new Audio('https://www.myinstants.com/media/sounds/ka-ching.mp3'));

  // 1. Calculate Total Debt
  const totalAPR = contracts.reduce((acc, curr) => {
    return acc + calculateDebt(curr).totalDebt;
  }, 0);

  // 2. Find "Most Wanted" (Highest Debt)
  const mostWanted = [...contracts].sort((a, b) => 
    calculateDebt(b).totalDebt - calculateDebt(a).totalDebt
  )[0];

  // 3. Find "Cleanest" (Debt Free)
  const cleanest = contracts.find(c => calculateDebt(c).totalDebt === 0);

  const handleFinish = () => {
    sfxCoin.current.volume = 1.0; 
    // Try to play - browsers might block if no interaction happened yet
    sfxCoin.current.play().catch(e => console.log("Sound blocked until click:", e));
  };

  // 4. Construct Ticker Strings
  const msg1 = ":: NEN CONSUMER FINANCE :: INTEREST RATES AT 1% DAILY";
  const msg2 = mostWanted ? `👑 PUBLIC ENEMY #1: ${mostWanted.name.toUpperCase()} (${calculateDebt(mostWanted).totalDebt} APR)` : "";
  const msg3 = cleanest ? `💎 HUNTER STAR: ${cleanest.name.toUpperCase()}` : "";
  const msg4 = recentActivity ? ` // ${recentActivity} // ` : "";

  return (
    <div className="dashboard-container">
      
      <div className="stat-box" style={{marginTop: '10px'}}>
         <div className="stat-label">TOTAL OUTSTANDING AURA</div>
         <div className="stat-value">
            <CountUp end={totalAPR} duration={2500} onFinish={handleFinish} />
            <span style={{fontSize: '1rem', color: '#666', marginLeft:'10px'}}>APR</span>
         </div>
      </div>

      {/* MOVED TICKER TO BOTTOM OF DASHBOARD */}
      <div className="ticker-wrap" style={{marginTop: '20px', borderTop: '1px solid #333', borderBottom: 'none'}}>
        <div className="ticker">
           {msg1} &nbsp;&nbsp;&nbsp; {msg4} &nbsp;&nbsp;&nbsp; {msg2} &nbsp;&nbsp;&nbsp; {msg3} &nbsp;&nbsp;&nbsp; :: FAILURE TO PAY WILL RESULT IN EXCOMMUNICATION ::
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
