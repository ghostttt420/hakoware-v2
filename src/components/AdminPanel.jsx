import { useState } from 'react';
import { createContract } from '../services/firebase'; // We are using the Object version now
import { sendSystemEmail } from '../services/emailService'; 
import { calculateDebt } from '../utils/gameLogic';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(50); 
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); 

  const handleAdd = async () => {
      if (!name) return;
      
      const finalDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      // FORCE NUMBER CONVERSION
      const finalLimit = Number(limit); 

      // 1. Math Check
      const mockContract = {
          baseDebt: 0,
          limit: finalLimit,
          lastSpoke: finalDate 
      };
      const stats = calculateDebt(mockContract);
      const isImmediateBankruptcy = stats.totalDebt >= finalLimit;

      // 2. Email Trigger
      if (isImmediateBankruptcy && email) {
          sendSystemEmail('BANKRUPTCY', {
              name: name,
              email: email,
              totalDebt: stats.totalDebt, 
              daysMissed: stats.daysMissed
          }, null, true); 
      }

      // --- DEBUG POPUP ---
      // This will show you exactly what is being sent.
      // If this says 500, the Admin Panel is working perfectly.
      // alert(`DEBUG CHECK:\nName: ${name}\nLimit: ${finalLimit}`); 
      // (Commented out the alert for production, but uncomment if you want to see it)

      // 3. Save to Database (Sending a SINGLE OBJECT)
      await createContract({
          name: name,
          email: email,
          baseDebt: 0,
          limit: finalLimit, // <--- This MUST be the number you typed
          lastSpoke: finalDate,
          lastBankruptcyEmail: isImmediateBankruptcy ? new Date().toISOString() : null
      });
      
      // Reset
      setName('');
      setEmail('');
      setLimit(50);
      setIsOpen(false);
      onRefresh("SYSTEM: NEW CONTRACT ISSUED"); 
  };

  return (
    <div style={{margin: '20px', textAlign: 'center'}}>
      {!isOpen ? (
          <button onClick={() => setIsOpen(true)} className="action-btn" style={{width: '100%'}}>
             + LEND AURA
          </button>
      ) : (
          <div style={{background: '#222', padding: '15px', border: '1px solid #444', borderRadius:'8px', textAlign:'left'}}>
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
