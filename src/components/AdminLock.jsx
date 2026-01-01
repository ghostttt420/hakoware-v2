import { useState } from 'react';

const AdminLock = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // --- SET YOUR PIN HERE ---
  const SECRET_CODE = "1234"; 

  const handleCheck = () => {
    if (pin === SECRET_CODE) {
        onUnlock();
    } else {
        setError(true);
        setPin('');
        setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div style={{
        background: '#111', padding: '20px', borderRadius: '8px', 
        border: `1px solid ${error ? 'red' : '#333'}`, 
        textAlign: 'center', marginBottom: '20px',
        animation: error ? 'shake 0.3s' : 'none'
    }}>
        <h3 style={{color: '#ffd700', marginTop: 0}}>🔒 ADMIN LOCKED</h3>
        <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="ENTER PIN"
            style={{
                background: '#000', border: '1px solid #444', color: 'white',
                padding: '10px', width: '100px', textAlign: 'center', fontSize: '1.2rem',
                letterSpacing: '5px', marginBottom: '10px'
            }}
        />
        <br/>
        <button onClick={handleCheck} className="action-btn" style={{width: 'auto', padding: '5px 20px'}}>
            UNLOCK
        </button>
        
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
            100% { transform: translateX(0); }
          }
        `}</style>
    </div>
  );
};

export default AdminLock;
