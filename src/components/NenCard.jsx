import { calculateDebt, calculateCreditScore } from '../utils/gameLogic';
import CountUp from './CountUp';



const NenCard = ({ contract, index, isAdmin, onAction, onPoke }) => {
  const { totalDebt, daysMissed, limit } = calculateDebt(contract);
  const isBankrupt = totalDebt >= limit;
  const isClean = totalDebt === 0;
  
  // Ranking Logic (Borders)
  let rankClass = '';
  if (!isClean && !isBankrupt) {
      if (index === 0) rankClass = 'rank-0'; // Gold
      else if (index === 1) rankClass = 'rank-1'; // Silver
      else if (index === 2) rankClass = 'rank-2'; // Bronze
  }

  // State Class (Background Color)
  let stateClass = '';
  if (isBankrupt) stateClass = 'bankrupt';
  else if (isClean) stateClass = 'clean-record'; // <--- NEW STYLE

  // Button Logic
  let btnText = "📜 MAKE A VOW";
  let btnClass = "notify-btn";

  if (isClean) {
      btnText = "✨ FLEX STATUS";
      btnClass += " flex-btn";
  } else if (isBankrupt) {
      btnText = "🏳️ BEG FOR AURA";
  }

  return (
    <div className={`card ${stateClass} ${rankClass}`}>
      <div className="card-header">
        <div>
            <h3>{contract.name}</h3>
            {isAdmin && <div style={{fontSize:'0.6rem', color:'#666'}}>{contract.email}</div>}
        </div>
        
        {/* Mascot / Poke Area */}
        <div 
            className="mascot-icon-wrapper" 
            style={{cursor: 'pointer'}}
            // Pass the status to the Poke Handler
            onClick={() => onPoke(contract.name, isBankrupt, isClean)}
        >
          {isBankrupt ? (
              <span className="mascot-icon demon">👹</span>
          ) : isClean ? (
              <span className="mascot-icon angel">💎</span> 
          ) : (
              <span className="mascot-icon fairy floating">🧚</span>
          )}
        </div>
      </div>

      <div className="debt-display">
         <CountUp end={totalDebt} duration={2000} /> 
        <span style={{fontSize: '0.5em'}}> APR</span>
      </div>

      <div style={{textAlign: 'center'}}>
        <div className="soul-score-container">
            <span className="soul-label">AURA SCORE</span>
            <span className="soul-value" style={{color: calculateCreditScore(totalDebt, daysMissed) > 700 ? '#00e676' : '#ff4444'}}>
                {calculateCreditScore(totalDebt, daysMissed)}
            </span>
        </div>
      </div>

      <div className="info">
        Interest: +1/day<br/>Limit: {limit} • Ghosted: {daysMissed}d
      </div>

      {isBankrupt && <div style={{color:'var(--red)', fontWeight:'bold', textAlign:'center', marginBottom:'10px'}}>BANKRUPTCY!</div>}
      {isClean && <div style={{color:'var(--blue)', fontWeight:'bold', textAlign:'center', marginBottom:'10px'}}>DEBT FREE</div>}

      {/* Action Buttons */}
      {isAdmin ? (
          <div className="action-row" style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <button 
                className="action-btn notify-btn" 
                style={{background:'#444', color:'white', flex:1}}
                onClick={() => onAction('SHAME', contract)}
            >
                📢 SHAME
            </button>
            <button 
                className="action-btn" 
                style={{flex:2}}
                onClick={() => onAction('RESET', contract)}
            >
                WE SPOKE
            </button>
          </div>
      ) : (
          <button 
            className={`action-btn ${btnClass}`} 
            style={{background:'#222', color:'#888', marginTop:'10px', border:'1px solid #444'}}
            onClick={() => onAction('MERCY', contract)}
          >
            {btnText}
          </button>
      )}
    </div>
  );
};

export default NenCard;
