import { calculateDebt, calculateCreditScore } from '../utils/gameLogic';
import CountUp from './CountUp';

const NenCard = ({ 
  contract, 
  friendship,
  currentUserId,
  index, 
  isAdmin, 
  onAction, 
  onPoke 
}) => {
  // Support both old "contract" format and new "friendship" format
  let displayName, email, totalDebt, daysMissed, limit, isBankrupt, isClean, streak;
  let myData, friendData, friend;

  if (friendship && currentUserId) {
    // New friendship format
    const isUser1 = friendship.myPerspective === 'user1';
    myData = isUser1 ? friendship.user1Perspective : friendship.user2Perspective;
    friendData = isUser1 ? friendship.user2Perspective : friendship.user1Perspective;
    friend = isUser1 ? friendship.user2 : friendship.user1;
    
    displayName = friend.displayName;
    email = friend.email;
    streak = friendship.streak || 0;

    const stats = calculateDebt({
      baseDebt: myData.baseDebt,
      lastInteraction: myData.lastInteraction,
      bankruptcyLimit: myData.limit
    });
    
    totalDebt = stats.totalDebt;
    daysMissed = stats.daysMissed;
    limit = myData.limit;
    isBankrupt = totalDebt >= limit;
    isClean = totalDebt === 0;
  } else {
    // Old contract format (fallback)
    const stats = calculateDebt(contract);
    totalDebt = stats.totalDebt;
    daysMissed = stats.daysMissed;
    limit = stats.limit;
    isBankrupt = totalDebt >= limit;
    isClean = totalDebt === 0;
    displayName = contract.name;
    email = contract.email;
    streak = 0;
    myData = { baseDebt: contract.baseDebt || 0 };
    friendData = null;
  }
  
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
  else if (isClean) stateClass = 'clean-record';

  // Button Logic
  let btnText = "📜 CHECK IN";
  let btnClass = "notify-btn";
  let actionType = 'CHECKIN';

  if (isClean) {
    btnText = "✨ FLEX STATUS";
    btnClass += " flex-btn";
    actionType = 'MERCY';
  } else if (isBankrupt) {
    btnText = "🏳️ BEG FOR AURA";
    actionType = 'BEG';
  }

  const data = friendship || contract;

  return (
    <div className={`card ${stateClass} ${rankClass}`}>
      <div className="card-header">
        <div>
          <h3>{displayName}</h3>
          {isAdmin && <div style={{fontSize:'0.6rem', color:'#666'}}>{email}</div>}
        </div>
        
        {/* Mascot / Poke Area */}
        <div 
          className="mascot-icon-wrapper" 
          style={{cursor: 'pointer'}}
          onClick={() => onPoke(displayName, isBankrupt, isClean)}
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

      {/* Main Debt Display */}
      <div className="debt-display">
        <CountUp end={totalDebt} duration={2000} />
        <span style={{fontSize: '0.5em'}}> APR</span>
      </div>

      {/* Mutual Tracking - Show what friend owes you */}
      {friendData && (
        <div style={{ 
          textAlign: 'center', 
          padding: '8px 12px', 
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '6px',
          margin: '10px 0',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: '#666' }}>They owe you: </span>
          {(() => {
            const friendStats = calculateDebt({
              baseDebt: friendData.baseDebt,
              lastInteraction: friendData.lastInteraction,
              bankruptcyLimit: friendData.limit
            });
            const friendBankrupt = friendStats.totalDebt >= friendStats.limit;
            return (
              <span style={{ 
                color: friendBankrupt ? '#ff4444' : friendStats.totalDebt > 0 ? '#ffd700' : '#00e676',
                fontWeight: 'bold'
              }}>
                {friendStats.totalDebt} APR
                {friendBankrupt && <span style={{ fontSize: '0.7rem', marginLeft: '5px' }}>(BANKRUPT)</span>}
              </span>
            );
          })()}
        </div>
      )}

      <div style={{textAlign: 'center'}}>
        <div className="soul-score-container">
          <span className="soul-label">AURA SCORE</span>
          <span className="soul-value" style={{color: calculateCreditScore(totalDebt, daysMissed) > 700 ? '#00e676' : '#ff4444'}}>
            {calculateCreditScore(totalDebt, daysMissed)}
          </span>
        </div>
      </div>

      <div className="info">
        Interest: +1/day<br/>
        Limit: {limit} • Ghosted: {daysMissed}d
        {streak > 0 && <><br/>🔥 Streak: {streak} days</>}
      </div>

      {isBankrupt && <div style={{color:'var(--red)', fontWeight:'bold', textAlign:'center', marginBottom:'10px'}}>BANKRUPTCY!</div>}
      {isClean && <div style={{color:'var(--blue)', fontWeight:'bold', textAlign:'center', marginBottom:'10px'}}>DEBT FREE</div>}

      {/* Action Buttons */}
      {isAdmin ? (
        <div className="action-row" style={{display:'flex', gap:'10px', marginTop:'10px'}}>
          <button 
            className="action-btn notify-btn" 
            style={{background:'#444', color:'white', flex:1}}
            onClick={() => onAction('SHAME', data)}
          >
            📢 SHAME
          </button>
          <button 
            className="action-btn" 
            style={{flex:2}}
            onClick={() => onAction('RESET', data)}
          >
            WE SPOKE
          </button>
        </div>
      ) : (
        <div className="action-row" style={{display:'flex', gap:'10px', marginTop:'10px'}}>
          <button 
            className={`action-btn ${btnClass}`}
            style={{flex: isBankrupt ? 2 : 1}}
            onClick={() => onAction(actionType, data)}
          >
            {btnText}
          </button>
          
          {/* Aura Marketplace - Bail out friend */}
          {friendData && (() => {
            const friendStats = calculateDebt({
              baseDebt: friendData.baseDebt,
              lastInteraction: friendData.lastInteraction,
              bankruptcyLimit: friendData.limit
            });
            if (friendStats.totalDebt > 0) {
              return (
                <button 
                  className="action-btn"
                  style={{
                    flex: 1,
                    background: '#004d40',
                    color: '#00e676',
                    border: '1px solid #00e676'
                  }}
                  onClick={() => onAction('BAILOUT', data)}
                >
                  💸 BAIL
                </button>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default NenCard;
