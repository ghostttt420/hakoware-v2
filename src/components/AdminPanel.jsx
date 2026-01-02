import { useState } from 'react';
import { createContract } from '../services/firebase';
// NEW IMPORTS NEEDED FOR THE FIX
import { sendSystemEmail } from '../services/emailService'; 
import { calculateDebt } from '../utils/gameLogic';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State (Kept exactly as you had it)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(50); 
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); 

  const handleAdd = async () => {
      if (!name) return;
      
      // 1. Calculate the Date
      const finalDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      const limitVal = Number(limit);

      // --- THE FIX STARTS HERE ---
      
      // 2. Simulate the Math to see if they are instantly bankrupt
      const mockContract = {
          baseDebt: 0, // Debt comes from Time, so base is 0
          limit: limitVal,
          lastSpoke: finalDate 
      };
      const stats = calculateDebt(mockContract);
      const isImmediateBankruptcy = stats.totalDebt >= limitVal;

      // 3. Send Email Immediately if needed
      if (isImmediateBankruptcy && email) {
          console.log(`Instant Bankruptcy! (${stats.totalDebt} >= ${limitVal})`);
          sendSystemEmail('BANKRUPTCY', {
              name: name,
              email: email,
              totalDebt: stats.totalDebt, 
              daysMissed: stats.daysMissed
          }, null, true); 
      }

      // 4. Create Contract (Sending as Object to support the email timer)
      await createContract({
          name: name,
          email: email,
          baseDebt: 0,
          limit: limitVal,
          lastSpoke: finalDate,
          // Save the timestamp so we don't email them again for 10 days
          lastBankruptcyEmail: isImmediateBankruptcy ? new Date().toISOString() : null
      });

      // --- FIX ENDS HERE ---
      
      // Reset & Refresh
      setName('');
      setEmail('');
      setLimit(50);
      setDateStr(new Date().toISOString().split('T')[0]);
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
