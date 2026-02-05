import { useRef } from 'react';
import CountUp from './CountUp';
import { calculateDebt } from '../utils/gameLogic';

const Dashboard = ({ friendships, recentActivity }) => {
  const sfxCoin = useRef(new Audio('https://www.myinstants.com/media/sounds/ka-ching.mp3'));

  // Calculate total APR across all friendships (what user owes)
  const totalAPR = friendships.reduce((acc, friendship) => {
    const isUser1 = friendship.myPerspective === 'user1';
    const myData = isUser1 ? friendship.user1Perspective : friendship.user2Perspective;
    const stats = calculateDebt({
      baseDebt: myData.baseDebt,
      lastInteraction: myData.lastInteraction,
      bankruptcyLimit: myData.limit
    });
    return acc + stats.totalDebt;
  }, 0);

  // Find most wanted (highest debt)
  const mostWanted = [...friendships].sort((a, b) => {
    const aStats = calculateDebt({
      baseDebt: a.myPerspective === 'user1' ? a.user1Perspective.baseDebt : a.user2Perspective.baseDebt,
      lastInteraction: a.myPerspective === 'user1' ? a.user1Perspective.lastInteraction : a.user2Perspective.lastInteraction,
      bankruptcyLimit: a.myPerspective === 'user1' ? a.user1Perspective.limit : a.user2Perspective.limit
    });
    const bStats = calculateDebt({
      baseDebt: b.myPerspective === 'user1' ? b.user1Perspective.baseDebt : b.user2Perspective.baseDebt,
      lastInteraction: b.myPerspective === 'user1' ? b.user1Perspective.lastInteraction : b.user2Perspective.lastInteraction,
      bankruptcyLimit: b.myPerspective === 'user1' ? b.user1Perspective.limit : b.user2Perspective.limit
    });
    return bStats.totalDebt - aStats.totalDebt;
  })[0];

  // Find cleanest friend (debt free)
  const cleanest = friendships.find(f => {
    const myData = f.myPerspective === 'user1' ? f.user1Perspective : f.user2Perspective;
    const stats = calculateDebt({
      baseDebt: myData.baseDebt,
      lastInteraction: myData.lastInteraction,
      bankruptcyLimit: myData.limit
    });
    return stats.totalDebt === 0;
  });

  // Calculate stats
  const totalFriends = friendships.length;
  const activeStreaks = friendships.filter(f => f.streak > 0).length;
  const bankruptcies = friendships.filter(f => {
    const myData = f.myPerspective === 'user1' ? f.user1Perspective : f.user2Perspective;
    const stats = calculateDebt({
      baseDebt: myData.baseDebt,
      lastInteraction: myData.lastInteraction,
      bankruptcyLimit: myData.limit
    });
    return stats.totalDebt >= stats.limit;
  }).length;

  const handleFinish = () => {
    sfxCoin.current.volume = 1.0; 
    sfxCoin.current.play().catch(e => console.log("Sound blocked:", e));
  };

  // Ticker Text Parts
  const msg1 = ":: NEN CONSUMER FINANCE :: INTEREST RATES AT 1% DAILY";
  const msg2 = mostWanted ? `MOST WANTED: ${mostWanted.friend?.displayName?.toUpperCase() || 'UNKNOWN'} (${mostWanted.myDebt || 0} APR)` : "";
  const msg3 = cleanest ? `HUNTER STAR: ${cleanest.friend?.displayName?.toUpperCase() || 'UNKNOWN'}` : "";
  const msg4 = recentActivity ? ` // ${recentActivity} // ` : "";
  const msg5 = `STATS: ${totalFriends} FRIENDS | ${activeStreaks} STREAKS | ${bankruptcies} BANKRUPTCIES`;

  // Combine them into one string
  const fullText = `${msg1}   ${msg4}   ${msg2}   ${msg3}   ${msg5}   :: FAILURE TO PAY WILL RESULT IN EXCOMMUNICATION ::`;

  return (
    <div className="dashboard-container">
      
      <div className="stat-box" style={{marginTop: '10px'}}>
         <div className="stat-label">TOTAL OUTSTANDING AURA</div>
         <div className="stat-value">
            <CountUp end={totalAPR} duration={2500} onFinish={handleFinish} />
            <span style={{fontSize: '1rem', color: '#666', marginLeft:'10px'}}>APR</span>
         </div>
      </div>

      {/* Quick Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        padding: '15px',
        marginTop: '15px',
        background: '#111',
        border: '1px solid #222',
        borderRadius: '8px'
      }}>
        <StatItem label="Friends" value={totalFriends} />
        <StatItem label="Active Streaks" value={activeStreaks} color="#00e676" />
        <StatItem label="Bankruptcies" value={bankruptcies} color="#ff4444" />
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

const StatItem = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      fontSize: '1.5rem', 
      fontWeight: 'bold', 
      color: color || '#fff',
      fontFamily: 'Courier New'
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: '0.7rem', 
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      {label}
    </div>
  </div>
);

export default Dashboard;
