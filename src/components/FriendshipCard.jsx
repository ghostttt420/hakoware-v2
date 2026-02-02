import { useState } from 'react';
import { calculateDebt, calculateCreditScore } from '../utils/gameLogic';
import CountUp from './CountUp';

const FriendshipCard = ({ 
  friendship, 
  index, 
  currentUserId,
  onAction, 
  onPoke 
}) => {
  // Determine which perspective to show
  const isUser1 = friendship.myPerspective === 'user1';
  const myData = isUser1 ? friendship.user1Perspective : friendship.user2Perspective;
  const friendData = isUser1 ? friendship.user2Perspective : friendship.user1Perspective;
  const friend = isUser1 ? friendship.user2 : friendship.user1;

  // Calculate debt from MY perspective (how much I owe my friend)
  const myDebtStats = calculateDebt({
    baseDebt: myData.baseDebt,
    lastInteraction: myData.lastInteraction,
    bankruptcyLimit: myData.limit
  });

  // Calculate debt from FRIEND's perspective (how much they owe me)
  const friendDebtStats = calculateDebt({
    baseDebt: friendData.baseDebt,
    lastInteraction: friendData.lastInteraction,
    bankruptcyLimit: friendData.limit
  });

  const myIsBankrupt = myDebtStats.totalDebt >= myDebtStats.limit;
  const myIsClean = myDebtStats.totalDebt === 0;
  const friendIsBankrupt = friendDebtStats.totalDebt >= friendDebtStats.limit;

  // Ranking Logic (Borders)
  let rankClass = '';
  if (!myIsClean && !myIsBankrupt) {
    if (index === 0) rankClass = 'rank-0'; // Gold
    else if (index === 1) rankClass = 'rank-1'; // Silver
    else if (index === 2) rankClass = 'rank-2'; // Bronze
  }

  // State Class (Background Color)
  let stateClass = '';
  if (myIsBankrupt) stateClass = 'bankrupt';
  else if (myIsClean) stateClass = 'clean-record';

  // Button Logic
  let btnText = "📜 CHECK IN";
  let actionType = "CHECKIN";
  let btnClass = "notify-btn";

  if (myIsClean) {
    btnText = "✨ FLEX STATUS";
    btnClass += " flex-btn";
  } else if (myIsBankrupt) {
    btnText = "🏳️ BEG FOR AURA";
  }

  return (
    <div className={`card ${stateClass} ${rankClass}`}>
      <div className="card-header">
        <div>
          <h3>{friend.displayName}</h3>
          <div style={{ fontSize: '0.6rem', color: '#666' }}>{friend.email}</div>
        </div>
        
        {/* Avatar / Mascot */}
        <div 
          className="mascot-icon-wrapper" 
          style={{ cursor: 'pointer' }}
          onClick={() => onPoke(friend.displayName, myIsBankrupt, myIsClean)}
        >
          {friend.avatar ? (
            <img 
              src={friend.avatar} 
              alt={friend.displayName}
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
          ) : myIsBankrupt ? (
            <span className="mascot-icon demon">👹</span>
          ) : myIsClean ? (
            <span className="mascot-icon angel">💎</span>
          ) : (
            <span className="mascot-icon fairy floating">🧚</span>
          )}
        </div>
      </div>

      {/* My Debt (What I owe) */}
      <div className="debt-display">
        <CountUp end={myDebtStats.totalDebt} duration={2000} />
        <span style={{ fontSize: '0.5em' }}> APR</span>
      </div>

      {/* Friend's Debt to Me */}
      <div style={{ 
        textAlign: 'center', 
        padding: '8px 12px', 
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
        margin: '10px 0'
      }}>
        <span style={{ color: '#666', fontSize: '0.75rem' }}>
          They owe you: 
        </span>
        <span style={{ 
          color: friendIsBankrupt ? '#ff4444' : friendDebtStats.totalDebt > 0 ? '#ffd700' : '#00e676',
          fontWeight: 'bold',
          marginLeft: '5px'
        }}>
          {friendDebtStats.totalDebt} APR
        </span>
        {friendIsBankrupt && (
          <span style={{ color: '#ff4444', fontSize: '0.7rem', marginLeft: '5px' }}>
            (BANKRUPT)
          </span>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div className="soul-score-container">
          <span className="soul-label">AURA SCORE</span>
          <span className="soul-value" style={{ 
            color: calculateCreditScore(myDebtStats.totalDebt, myDebtStats.daysMissed) > 700 ? '#00e676' : '#ff4444' 
          }}>
            {calculateCreditScore(myDebtStats.totalDebt, myDebtStats.daysMissed)}
          </span>
        </div>
      </div>

      <div className="info">
        Interest: +1/day<br/>
        Limit: {myData.limit} • Ghosted: {myDebtStats.daysMissed}d<br/>
        🔥 Streak: {friendship.streak || 0} days
      </div>

      {myIsBankrupt && (
        <div style={{ 
          color: 'var(--red)', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '10px' 
        }}>
          BANKRUPTCY!
        </div>
      )}
      {myIsClean && (
        <div style={{ 
          color: 'var(--blue)', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '10px' 
        }}>
          DEBT FREE
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-row" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          className={`action-btn ${btnClass}`}
          style={{ flex: 2 }}
          onClick={() => onAction(myIsBankrupt ? 'BEG' : actionType, friendship)}
        >
          {btnText}
        </button>
        
        {myIsBankrupt && (
          <button 
            className="action-btn"
            style={{ 
              flex: 1, 
              background: '#330000', 
              color: '#ff4444',
              border: '1px solid #ff4444'
            }}
            onClick={() => onAction('SETTINGS', friendship)}
          >
            ⚙️
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendshipCard;
