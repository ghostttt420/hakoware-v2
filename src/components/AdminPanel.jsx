import { useState } from 'react';
import { createContract } from '../services/firebase';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(50); // Default limit
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]); // Default to Today (YYYY-MM-DD)

  const handleAdd = async () => {
      if (!name) return;
      
      // Use the picked date, or fallback to now
      const finalDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
      
      await createContract(name, finalDate, limit, email);
      
      // Reset & Refresh
      setName('');
      setEmail('');
      setLimit(50);
      setIsOpen(false);
      onRefresh(); 
  };

  return (
    <div className="controls" style={{margin: '20px', textAlign: 'center'}}>
      {!isOpen ? (
          <button onClick={() => setIsOpen(true)} className="action-btn" style={{width: '100%'}}>
             + LEND AURA (ADD FRIEND)
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
