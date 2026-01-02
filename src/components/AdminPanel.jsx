import { useState } from 'react';
// 1. UPDATE IMPORTS: Switch to addContract (object version) + Email/Math tools
import { addContract } from '../services/firebase'; 
import { sendSystemEmail } from '../services/emailService';
import { calculateDebt } from '../utils/gameLogic';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(50); 
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); 

  // 2. UPDATED LOGIC FUNCTION
  const handleAdd = async () => {
      if (!name) return;
      
      // A. Normalize the Date
      const finalDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      const limitVal = Number(limit);

      // B. PREDICT THE FUTURE (Simulate the debt based on the past date)
      const mockContract = {
          baseDebt: 0,
          limit: limitVal,
          lastSpoke: finalDate
      };
      
      // Calculate what their debt IS right now
      const stats = calculateDebt(mockContract); 
      const isImmediateBankruptcy = stats.totalDebt >= limitVal;

      // C. INSTANT EMAIL TRIGGER
      if (isImmediateBankruptcy && email) {
          console.log(`Instant Bankruptcy detected (${stats.totalDebt} >= ${limitVal}). Sending email...`);
          
          sendSystemEmail('BANKRUPTCY', {
              name: name,
              email: email,
              totalDebt: stats.totalDebt, 
              daysMissed: stats.daysMissed
          }, null, true); 
      }

      // D. SAVE TO DATABASE (Using object format to save the email timestamp)
      await addContract({
          name: name,
          email: email,
          baseDebt: 0,
          limit: limitVal,
          lastSpoke: finalDate,
          // If we sent an email just now, save the DATE so the loop waits 10 days
          lastBankruptcyEmail: isImmediateBankruptcy ? new Date().toISOString() : null
      });
      
      // Reset & Refresh
      setName('');
      setEmail('');
      setLimit(50);
      setIsOpen(false);
      onRefresh("SYSTEM: NEW CONTRACT ISSUED"); 
  };

  return (
    <div className="controls" style={{margin: '20px', textAlign: 'center'}}>
      {!isOpen ? (
          <button onClick={() => setIsOpen(true)} className="action-btn" style={{width: '100%'}}>
             + LEND AURA
          </button>
      ) : (
          <div style={{background: '#222', padding: '15px', border: '1px solid #444', borderRadius:'8px'}}>
              <h3 style={{marginTop:0, color:'#ffd700'}}>NEW CONTRACT</h3>
              
              <input 
                 placeholder="Name" 
                 value={name} onChange={e => setName(e.target.value)} 
                 style={inputStyle}
              />
              
              <input 
                 placeholder="Email (Optional)" 
                 value={email} onChange={e => setEmail(e.target.value)} 
                 style={inputStyle}
              />

              <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:'0.7rem', color:'#888'}}>Bankruptcy Limit</label>
                    <input 
                        type="number" 
                        value={limit} onChange={e => setLimit(e.target.value)} 
                        style={inputStyle}
                    />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:'0.7rem', color:'#888'}}>Last Spoke</label>
                    <input 
                        type="date" 
                        value={dateStr} onChange={e => setDateStr(e.target.value)} 
                        style={inputStyle}
                    />
                  </div>
              </div>

              <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={handleAdd} style={{flex:1, background:'green', color:'white', padding:'10px', border:'none', borderRadius:'4px'}}>CONFIRM</button>
                  <button onClick={() => setIsOpen(false)} style={{flex:1, background:'red', color:'white', padding:'10px', border:'none', borderRadius:'4px'}}>CANCEL</button>
              </div>
          </div>
      )}
    </div>
  );
};

const inputStyle = {
    display:'block', width:'100%', marginBottom:'10px', padding:'8px', 
    background:'#111', border:'1px solid #444', color:'white', borderRadius:'4px'
};

export default AdminPanel;
