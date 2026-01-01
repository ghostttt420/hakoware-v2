import { useRef } from 'react';
import CountUp from './CountUp';
import { calculateDebt } from '../utils/gameLogic';

const Dashboard = ({ contracts, recentActivity }) => {
  const sfxCoin = useRef(new Audio('https://www.myinstants.com/media/sounds/ka-ching.mp3'));

  const totalAPR = contracts.reduce((acc, curr) => {
    return acc + calculateDebt(curr).totalDebt;
  }, 0);

  const mostWanted = [...contracts].sort((a, b) => 
    calculateDebt(b).totalDebt - calculateDebt(a).totalDebt
  )[0];

  const cleanest = contracts.find(c => calculateDebt(c).totalDebt === 0);

  const handleFinish = () => {
    sfxCoin.current.volume = 1.0; 
    sfxCoin.current.play().catch(e => console.log("Sound blocked:", e));
  };

  // Ticker Text Parts
  const msg1 = ":: NEN CONSUMER FINANCE :: INTEREST RATES AT 1% DAILY";
  const msg2 = mostWanted ? `👑 MOST WANTED: ${mostWanted.name.toUpperCase()} (${calculateDebt(mostWanted).totalDebt} APR)` : "";
  const msg3 = cleanest ? `💎 HUNTER STAR: ${cleanest.name.toUpperCase()}` : "";
  const msg4 = recentActivity ? ` // ${recentActivity} // ` : "";

  // Combine them into one string
  const fullText = `${msg1}   ${msg4}   ${msg2}   ${msg3}   :: FAILURE TO PAY WILL RESULT IN EXCOMMUNICATION ::`;

  return (
    <div className="dashboard-container">
      
      <div className="stat-box" style={{marginTop: '10px'}}>
         <div className="stat-label">TOTAL OUTSTANDING AURA</div>
         <div className="stat-value">
            <CountUp end={totalAPR} duration={2500} onFinish={handleFinish} />
            <span style={{fontSize: '1rem', color: '#666', marginLeft:'10px'}}>APR</span>
         </div>
      </div>

      {/* Infinite Ticker Container */}
      <div className="ticker-wrap" style={{marginTop: '20px', borderTop: '1px solid #333', borderBottom: 'none'}}>
        <div className="ticker">
           {/* RENDER 1 */}
           <span>{fullText}</span>
           
           {/* SPACER */}
           <span style={{display: 'inline-block', width: '50px'}}></span>
           
           {/* RENDER 2 (Duplicate for Loop) */}
           <span>{fullText}</span>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
