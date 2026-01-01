import { useRef } from 'react';
import CountUp from './CountUp';
import { calculateDebt } from '../utils/gameLogic';

const Dashboard = ({ contracts }) => {
  // Sound Effect Ref
  const sfxCoin = useRef(new Audio('https://www.myinstants.com/media/sounds/coin_1.mp3'));

  // Calculate Total Debt
  const totalAPR = contracts.reduce((acc, curr) => {
    return acc + calculateDebt(curr).totalDebt;
  }, 0);

  // Play Sound when counting finishes
  const handleFinish = () => {
    sfxCoin.current.volume = 0.6; 
    sfxCoin.current.currentTime = 0;
    sfxCoin.current.play().catch(e => console.log("Audio blocked:", e));
  };

  return (
    <div className="dashboard-container">
      <div className="ticker-wrap">
        <div className="ticker">
           :: NEN CONSUMER FINANCE :: INTEREST RATES ADJUSTED TO 1% DAILY :: FAILURE TO PAY WILL RESULT IN SOCIAL CREDIT DEDUCTION ::
        </div>
      </div>

      <div className="stat-box" style={{marginTop: '20px'}}>
         <div className="stat-label">TOTAL OUTSTANDING AURA</div>
         <div className="stat-value">
            {/* The Animated Counter */}
            <CountUp end={totalAPR} duration={2500} onFinish={handleFinish} />
            <span style={{fontSize: '1rem', color: '#666', marginLeft:'10px'}}>APR</span>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
