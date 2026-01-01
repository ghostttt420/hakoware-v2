import { useState } from 'react';
import { createContract } from '../services/firebase';

const AdminPanel = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(50);

  const handleAdd = async () => {
      if (!name) return;
      await createContract(name, new Date().toISOString(), limit, email);
      
      // Reset & Refresh
      setName('');
      setEmail('');
      setIsOpen(false);
      onRefresh(); // Reloads the App data
  };

  return (
    <div className="controls" style={{margin: '20px', textAlign: 'center'}}>
      {!isOpen ? (
          <button onClick={() => setIsOpen(true)} className="action-btn" style={{width: '100%'}}>
             + LEND AURA (ADD FRIEND)
          </button>
      ) : (
          <div style={{background: '#222', padding: '15px', border: '1px solid #444'}}>
              <input 
                 placeholder="Name" 
                 value={name} onChange={e => setName(e.target.value)} 
                 style={{display:'block', width:'100%', marginBottom:'10px', padding:'8px'}}
              />
              <input 
                 placeholder="Email (Optional)" 
                 value={email} onChange={e => setEmail(e.target.value)} 
                 style={{display:'block', width:'100%', marginBottom:'10px', padding:'8px'}}
              />
              <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={handleAdd} style={{flex:1, background:'green', color:'white'}}>CONFIRM</button>
                  <button onClick={() => setIsOpen(false)} style={{flex:1, background:'red', color:'white'}}>CANCEL</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
