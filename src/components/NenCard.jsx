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
              <SettingsIcon size={16} color="#888" />
            </button>
          )}
          
          {/* Mascot - shows MY status to this friend */}
          <div 
            className="mascot-icon-wrapper" 
            style={{cursor: 'pointer'}}
            onClick={() => onPoke(displayName, iAmBankrupt, iAmClean)}
          >
            {iAmBankrupt ? (
              <SkullIcon size={28} color="#ff4444" />
            ) : iAmClean ? (
              <CrownIcon size={28} color="#ffd700" />
            ) : (
              <FlameIcon size={28} color="#888" />
            )}
          </div>
        </div>
      </div>

      {/* MY Debt Section (What I owe to this friend) */}
      <div style={{
        background: iAmBankrupt ? 'rgba(255,68,68,0.15)' : iAmClean ? 'rgba(0,230,118,0.1)' : iAmInWarningZone ? 'rgba(255,136,0,0.1)' : 'rgba(255,215,0,0.05)',
        border: `1px solid ${iAmBankrupt ? '#ff4444' : iAmClean ? '#00e676' : iAmInWarningZone ? '#ff8800' : '#333'}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          You owe {displayName}
        </div>
        <div className="debt-display" style={{ fontSize: '1.6rem', margin: 0 }}>
          <CountUp end={myStats.totalDebt} duration={2000} />
          <span style={{fontSize: '0.5em'}}> APR</span>
        </div>
        {iAmBankrupt && (
          <div style={{color: '#ff4444', fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold'}}>
            ⚠️ BANKRUPT
          </div>
        )}
        {iAmInWarningZone && !iAmBankrupt && (
          <div style={{color: '#ff8800', fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold'}}>
            ⚠️ {myStats.daysUntilBankrupt} days to bankruptcy
          </div>
        )}
      </div>

      {/* FRIEND's Debt Section (What they owe to me) */}
      {friendData && friendStats.totalDebt > 0 && (
        <div style={{
          background: friendIsBankrupt ? 'rgba(255,68,68,0.05)' : 'rgba(0,230,118,0.05)',
          border: `1px solid ${friendIsBankrupt ? '#ff4444' : '#00e676'}`,
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '8px'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '2px' }}>
            {displayName} owes you
          </div>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: 'bold',
            color: friendIsBankrupt ? '#ff4444' : '#00e676'
          }}>
            {friendStats.totalDebt} APR
            {friendIsBankrupt && <span style={{ fontSize: '0.65rem', marginLeft: '6px' }}>BANKRUPT</span>}
          </div>
        </div>
      )}

      <div style={{textAlign: 'center', marginBottom: '8px'}}>
        <div className="soul-score-container" style={{ padding: '4px 8px' }}>
          <span className="soul-label" style={{ fontSize: '0.55rem' }}>AURA</span>
          <span className="soul-value" style={{fontSize: '0.8rem', color: calculateCreditScore(myStats.totalDebt, myStats.daysMissed) > 700 ? '#00e676' : '#ff4444'}}>
            {calculateCreditScore(myStats.totalDebt, myStats.daysMissed)}
          </span>
        </div>
      </div>

      <div className="info" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>
        +1/day after {myData.limit}d • {Math.max(0, myData.limit - myStats.daysMissed)} free
        {myStats.daysOverLimit > 0 && <> • {myStats.daysOverLimit} accruing</>}
        {streak > 0 && (
          <>
            {' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#ffd700' }}>
              <FlameIcon size={10} color="#ffd700" />
              {streak}
            </span>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {isAdmin ? (
        <div className="action-row" style={{display:'flex', gap:'8px', marginTop:'8px'}}>
          <button 
            className="action-btn notify-btn" 
            style={{background:'#444', color:'white', flex:1, padding: '8px', fontSize: '0.75rem'}}
            onClick={() => onAction('SHAME', data)}
          >
            📢 SHAME
          </button>
          <button 
            className="action-btn" 
            style={{flex:2, padding: '8px', fontSize: '0.75rem'}}
            onClick={() => onAction('RESET', data)}
          >
            WE SPOKE
          </button>
        </div>
      ) : (
        <div className="action-row" style={{display:'flex', gap:'8px', marginTop:'8px'}}>
          {/* MY Action Button (what I should do about MY debt) */}
          <button 
            className={`action-btn ${btnClass}`}
            style={{flex: iAmBankrupt ? 2 : 1, padding: '8px', fontSize: '0.75rem'}}
            onClick={() => onAction(actionType, data)}
          >
            {btnText}
          </button>
          
          {/* Bailout Button - only show if FRIEND owes me money */}
          {friendData && friendStats.totalDebt > 0 && (
            <button 
              className="action-btn"
              style={{
                flex: 1,
                background: friendIsBankrupt ? '#330000' : '#004d40',
                color: friendIsBankrupt ? '#ff4444' : '#00e676',
                border: `1px solid ${friendIsBankrupt ? '#ff4444' : '#00e676'}`,
                padding: '8px',
                fontSize: '0.75rem'
              }}
              onClick={() => onAction('BAILOUT', data)}
            >
              {friendIsBankrupt ? 'SAVE' : 'BAIL'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NenCard;
