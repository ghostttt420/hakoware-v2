import { calculateDebt, calculateCreditScore, getDebtStatus } from '../utils/gameLogic';
import CountUp from './CountUp';
import { SkullIcon, CrownIcon, DollarIcon, FlameIcon, SettingsIcon } from './icons/Icons';

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
  let displayName, email, streak;
  let myData, friendData, friend;
  let myStats, friendStats;
  let iAmBankrupt, iAmClean, iAmInWarningZone, friendIsBankrupt;

  if (friendship && currentUserId) {
    // New friendship format
    const isUser1 = friendship.myPerspective === 'user1';
    myData = isUser1 ? friendship.user1Perspective : friendship.user2Perspective;
    friendData = isUser1 ? friendship.user2Perspective : friendship.user1Perspective;
    friend = isUser1 ? friendship.user2 : friendship.user1;
    
    displayName = friend.displayName;
    email = friend.email;
    streak = friendship.streak || 0;

    // Calculate MY debt (what I owe to this friend)
    myStats = calculateDebt({
      baseDebt: myData.baseDebt,
      lastInteraction: myData.lastInteraction,
      bankruptcyLimit: myData.limit
    });
    
    // Calculate FRIEND's debt (what they owe to me)
    friendStats = calculateDebt({
      baseDebt: friendData.baseDebt,
      lastInteraction: friendData.lastInteraction,
      bankruptcyLimit: friendData.limit
    });
    
    // NEW: Use the new bankruptcy logic from calculateDebt (bankrupt at 2x limit)
    iAmBankrupt = myStats.isBankrupt;
    iAmClean = myStats.totalDebt === 0;
    iAmInWarningZone = myStats.isInWarningZone;
    friendIsBankrupt = friendStats.isBankrupt;
  } else {
    // Old contract format (fallback)
    myStats = calculateDebt(contract);
    iAmBankrupt = myStats.isBankrupt;
    iAmClean = myStats.totalDebt === 0;
    iAmInWarningZone = myStats.isInWarningZone;
    friendIsBankrupt = false;
    displayName = contract.name;
    email = contract.email;
    streak = 0;
    myData = { baseDebt: contract.baseDebt || 0 };
    friendData = null;
    friendStats = { totalDebt: 0 };
  }
  
  // Ranking Logic (Borders) - based on MY debt
  let rankClass = '';
  if (!iAmClean && !iAmBankrupt) {
    if (index === 0) rankClass = 'rank-0'; // Gold
    else if (index === 1) rankClass = 'rank-1'; // Silver
    else if (index === 2) rankClass = 'rank-2'; // Bronze
  }

  // State Class (Background Color) - based on MY status
  let stateClass = '';
  if (iAmBankrupt) stateClass = 'bankrupt';
  else if (iAmClean) stateClass = 'clean-record';
  else if (iAmInWarningZone) stateClass = 'warning-zone';

  // Button Logic - based on MY status (what I should do)
  let btnText = "CHECK IN";
  let btnClass = "notify-btn";
  let actionType = 'CHECKIN';

  if (iAmClean) {
    btnText = "FLEX STATUS";
    btnClass += " flex-btn";
    actionType = 'MERCY';
  } else if (iAmBankrupt) {
    btnText = "BEG FOR AURA";
    actionType = 'BEG';
  } else if (iAmInWarningZone) {
    btnText = "CHECK IN NOW";
    btnClass += " warning-btn";
    actionType = 'CHECKIN';
  }

  const data = friendship || contract;

  return (
    <div className={`card ${stateClass} ${rankClass}`}>
      <div className="card-header">
        <div>
          <h3>{displayName}</h3>
          {isAdmin && <div style={{fontSize:'0.6rem', color:'#666'}}>{email}</div>}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Settings Button */}
          {!isAdmin && (
            <button
              onClick={() => onAction('SETTINGS', data)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                opacity: 0.5,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              title="Friendship Settings"
            >
              <SettingsIcon size={20} color="#888" />
            </button>
          )}
          
          {/* Mascot - shows MY status to this friend */}
          <div 
            className="mascot-icon-wrapper" 
            style={{cursor: 'pointer'}}
            onClick={() => onPoke(displayName, iAmBankrupt, iAmClean)}
          >
            {iAmBankrupt ? (
              <SkullIcon size={40} color="#ff4444" />
            ) : iAmClean ? (
              <CrownIcon size={40} color="#ffd700" />
            ) : (
              <FlameIcon size={40} color="#888" />
            )}
          </div>
        </div>
      </div>

      {/* MY Debt Section (What I owe to this friend) */}
      <div style={{
        background: iAmBankrupt ? 'rgba(255,68,68,0.15)' : iAmClean ? 'rgba(0,230,118,0.1)' : iAmInWarningZone ? 'rgba(255,136,0,0.1)' : 'rgba(255,215,0,0.05)',
        border: `1px solid ${iAmBankrupt ? '#ff4444' : iAmClean ? '#00e676' : iAmInWarningZone ? '#ff8800' : '#333'}`,
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          You owe {displayName}
        </div>
        <div className="debt-display" style={{ fontSize: '2rem', margin: 0 }}>
          <CountUp end={myStats.totalDebt} duration={2000} />
          <span style={{fontSize: '0.5em'}}> APR</span>
        </div>
        {iAmBankrupt && (
          <div style={{color: '#ff4444', fontSize: '0.75rem', marginTop: '5px', fontWeight: 'bold'}}>
            ⚠️ CHAPTER 7 BANKRUPTCY ⚠️
          </div>
        )}
        {iAmInWarningZone && !iAmBankrupt && (
          <div style={{color: '#ff8800', fontSize: '0.75rem', marginTop: '5px', fontWeight: 'bold'}}>
            ⚠️ WARNING: {myStats.daysUntilBankrupt} days until bankruptcy
          </div>
        )}
      </div>

      {/* FRIEND's Debt Section (What they owe to me) */}
      {friendData && friendStats.totalDebt > 0 && (
        <div style={{
          background: friendIsBankrupt ? 'rgba(255,68,68,0.05)' : 'rgba(0,230,118,0.05)',
          border: `1px solid ${friendIsBankrupt ? '#ff4444' : '#00e676'}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '10px'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '3px' }}>
            {displayName} owes you
          </div>
          <div style={{ 
            fontSize: '1.3rem', 
            fontWeight: 'bold',
            color: friendIsBankrupt ? '#ff4444' : '#00e676'
          }}>
            {friendStats.totalDebt} APR
            {friendIsBankrupt && <span style={{ fontSize: '0.7rem', marginLeft: '8px' }}>BANKRUPT</span>}
          </div>
        </div>
      )}

      <div style={{textAlign: 'center', marginBottom: '10px'}}>
        <div className="soul-score-container">
          <span className="soul-label">AURA SCORE</span>
          <span className="soul-value" style={{color: calculateCreditScore(myStats.totalDebt, myStats.daysMissed) > 700 ? '#00e676' : '#ff4444'}}>
            {calculateCreditScore(myStats.totalDebt, myStats.daysMissed)}
          </span>
        </div>
      </div>

      <div className="info">
        Interest: +1/day after {myData.limit} days<br/>
        Free days: {Math.max(0, myData.limit - myStats.daysMissed)} remaining
        {myStats.daysOverLimit > 0 && <> • Accruing: {myStats.daysOverLimit} days</>}
        {streak > 0 && (
          <>
            <br/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <FlameIcon size={12} color="#ffd700" />
              Streak: {streak} days
            </span>
          </>
        )}
      </div>

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
          {/* MY Action Button (what I should do about MY debt) */}
          <button 
            className={`action-btn ${btnClass}`}
            style={{flex: iAmBankrupt ? 2 : 1}}
            onClick={() => onAction(actionType, data)}
          >
            {btnText}
          </button>
          
          {/* Voice Check-in Button - only show for check-in actions */}
          {actionType === 'CHECKIN' && (
            <button 
              className="action-btn"
              style={{
                flex: 0.5,
                background: '#1a1a1a',
                border: '1px solid #444',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => onAction('VOICE_CHECKIN', data)}
              title="Voice Check-in"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
          )}
          
          {/* Bailout Button - only show if FRIEND owes me money */}
          {friendData && friendStats.totalDebt > 0 && (
            <button 
              className="action-btn"
              style={{
                flex: 1,
                background: friendIsBankrupt ? '#330000' : '#004d40',
                color: friendIsBankrupt ? '#ff4444' : '#00e676',
                border: `1px solid ${friendIsBankrupt ? '#ff4444' : '#00e676'}`
              }}
              onClick={() => onAction('BAILOUT', data)}
            >
              {friendIsBankrupt ? 'SAVE THEM' : 'BAIL'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NenCard;
