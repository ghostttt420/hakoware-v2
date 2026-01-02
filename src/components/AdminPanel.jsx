import { useState } from 'react';
import { createContract } from '../services/firebase'; 
import { sendSystemEmail } from '../services/emailService';
import { calculateDebt } from '../utils/gameLogic';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    limit: 50,
    // Default to Today's date string (YYYY-MM-DD)
    dateStr: new Date().toISOString().split('T')[0] 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const limitVal = parseFloat(formData.limit) || 50;
    
    // 1. Force the Time to Midnight for accurate day counting
    // (This prevents timezone issues making it look like 0 days)
    const finalDate = formData.dateStr 
        ? new Date(formData.dateStr).toISOString() 
        : new Date().toISOString();

    // 2. Simulate Debt (Debt = Days Missed)
    const mockContract = {
        baseDebt: 0, 
        limit: limitVal,
        lastSpoke: finalDate 
    };
    
    const stats = calculateDebt(mockContract); 
    const isImmediateBankruptcy = stats.totalDebt >= limitVal;

    // Debugging: Check console to see if days are being counted
    console.log(`Simulation: ${stats.daysMissed} Days Missed = ${stats.totalDebt} Debt`);

    // 3. Instant Email
    if (isImmediateBankruptcy && formData.email) {
        console.log(`Instant Bankruptcy! (${stats.totalDebt} >= ${limitVal})`);
        sendSystemEmail('BANKRUPTCY', {
            name: formData.name,
            email: formData.email,
            totalDebt: stats.totalDebt, 
            daysMissed: stats.daysMissed
        }, null, true); 
    }

    // 4. Save to Database
    await createContract({
        name: formData.name,
        email: formData.email,
        baseDebt: 0, // Always 0 because Debt comes from Time
        limit: limitVal,
        lastSpoke: finalDate, 
        lastBankruptcyEmail: isImmediateBankruptcy ? new Date().toISOString() : null 
    });

    setFormData({ name: '', email: '', limit: 50, dateStr: new Date().toISOString().split('T')[0] });
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
              <form onSubmit={handleSubmit}>
                  <input 
                     required placeholder="Name" 
                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                     style={inputStyle}
                  />
                  
                  <input 
                     type="email" placeholder="Email (Required)" 
                     value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                     style={inputStyle}
                  />

                  <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                      <div style={{flex:1}}>
                        <label style={{fontSize:'0.7rem', color:'#888'}}>Bankruptcy Limit</label>
                        <input type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: e.target.value})} style={inputStyle} />
                      </div>
                      <div style={{flex:1}}>
                        <label style={{fontSize:'0.7rem', color:'#888'}}>Last Spoke</label>
                        <input type="date" value={formData.dateStr} onChange={e => setFormData({...formData, dateStr: e.target.value})} style={inputStyle} />
                      </div>
                  </div>
                  
                  <div style={{display:'flex', gap:'10px'}}>
                      <button type="submit" style={{flex:1, background:'green', color:'white', padding:'10px', border:'none', borderRadius:'4px'}}>CONFIRM</button>
                      <button type="button" onClick={() => setIsOpen(false)} style={{flex:1, background:'red', color:'white', padding:'10px', border:'none', borderRadius:'4px'}}>CANCEL</button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};

const inputStyle = {
    display:'block', width:'100%', marginBottom:'5px', padding:'8px', 
    background:'#111', border:'1px solid #444', color:'white', borderRadius:'4px',
    fontFamily: 'Courier New'
};

export default AdminPanel;
