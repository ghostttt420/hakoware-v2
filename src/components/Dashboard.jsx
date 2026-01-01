import { calculateDebt } from '../utils/gameLogic';

const Dashboard = ({ contracts }) => {
  // 1. Calculate Global Stats
  let grandTotal = 0;
  let bankruptCount = 0;
  let highestDebtor = { name: 'Nobody', debt: -1 };
  
  let liveActions = []; 
  let warrants = [];    
  let systemMsgs = []; 

  contracts.forEach(c => {
      const stats = calculateDebt(c);
      grandTotal += stats.totalDebt;
      
      // Track High Score
      if (stats.totalDebt > highestDebtor.debt) {
          highestDebtor = { name: c.name, debt: stats.totalDebt };
      }

      // Live Activity (Today)
      if (stats.daysMissed === 0) {
          if (stats.totalDebt > 0) liveActions.push(`⏳ TIME DILATION: ${c.name} just secured a timer reset`);
          else liveActions.push(`💸 LIQUIDITY INJECTION: ${c.name} has wiped their debt clean`);
      }

      // Bankruptcy
      if (stats.totalDebt >= stats.limit) {
          bankruptCount++;
          warrants.push(`⚠️ BREACH OF CONTRACT: ${c.name} is insolvent (${stats.totalDebt} APR)`);
      }
  });

  // Construct Ticker Feed
  let feed = [];
  if (liveActions.length > 0) feed.push(...liveActions);
  if (highestDebtor.debt > 0) feed.push(`👑 PUBLIC ENEMY #1: ${highestDebtor.name}`);
  if (warrants.length > 0) feed.push(...warrants);
  
  systemMsgs.push(`🏦 TOTAL RESERVE: ${grandTotal} APR`);
  systemMsgs.push(`📉 MARKET UPDATE: Volatility Increasing`);
  systemMsgs.push(`👹 SYSTEM NOTICE: The Demon is watching`);
  feed.push(...systemMsgs);

  return (
    <div className="dashboard-container">
        {/* BIG NUMBER */}
        <div className="stat-box">
            <div className="stat-label">TOTAL OUTSTANDING AURA</div>
            <div className="stat-value">{grandTotal} <span style={{fontSize:'0.5em'}}>APR</span></div>
        </div>
        
        {/* TICKER */}
        <div className="ticker-wrap">
            <div className="ticker">
                {feed.map((msg, i) => (
                    <span key={i}>
                        {msg} &nbsp;&nbsp;&nbsp; <span style={{color:'#555'}}>///</span> &nbsp;&nbsp;&nbsp;
                    </span>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
