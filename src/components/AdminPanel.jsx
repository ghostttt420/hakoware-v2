import { useState } from 'react';
// FIX: Imported 'createContract' (Old Name)
import { createContract } from '../services/firebase'; 
import { sendSystemEmail } from '../services/emailService';
import { calculateDebt } from '../utils/gameLogic';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    limit: 50,
    dateStr: new Date().toISOString().split('T')[0] 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const limitVal = parseFloat(formData.limit) || 50;
    const finalDate = formData.dateStr ? new Date(formData.dateStr).toISOString() : new Date().toISOString();

    // 1. Simulate Debt
    const mockContract = {
        baseDebt: 0,
        limit: limitVal,
        lastSpoke: finalDate 
    };
    const stats = calculateDebt(mockContract); 
    const isImmediateBankruptcy = stats.totalDebt >= limitVal;

    // 2. Instant Email
    if (isImmediateBankruptcy && formData.email) {
        console.log(`Instant Bankruptcy! Sending email...`);
        sendSystemEmail('BANKRUPTCY', {
            name: formData.name,
            email: formData.email,
            totalDebt: stats.totalDebt, 
            daysMissed: stats.daysMissed
        }, null, true); 
    }

    // 3. Save to Database (Using 'createContract')
    // We pass an OBJECT now so we can include 'lastBankruptcyEmail'
    await createContract({
        name: formData.name,
        email: formData.email,
        baseDebt: 0,
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
             + LEND AURA (ADD FRIEND)
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
    display:'block', width:'100%', marginBottom:'10px', padding:'8px', 
    background:'#111', border:'1px solid #444', color:'white', borderRadius:'4px',
    fontFamily: 'Courier New'
};

export default AdminPanel;
