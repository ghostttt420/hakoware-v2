import { updateContract, deleteContract } from '../../services/firebase';
import { sendSystemEmail } from '../../services/emailService';
import { calculateDebt } from '../../utils/gameLogic'; // <--- FIXED: Added missing import

const SettleModal = ({ isOpen, onClose, contract, onRefresh, showToast }) => {
  // <--- FIXED: Added Safety Check (Prevents Crash)
  if (!isOpen || !contract) return null;

  const isAdmin = true; 

  const handleReset = async () => {
    // 1. Calculate the CURRENT total (Base + Interest)
    const stats = calculateDebt(contract);
    const currentTotal = stats.totalDebt;

    if(confirm(`Reset timer for ${contract.name}? (Debt will stay at ${currentTotal})`)) {
        // 2. Save the CURRENT TOTAL to the database, effectively "locking in" the interest
        await updateContract(contract.id, currentTotal, true);
        
        // 3. Send Email
        sendSystemEmail('RESET', { ...contract, ...stats }, showToast, true);

        showToast("Timer Reset (Interest Baked In)", "SUCCESS");
        onClose();
        onRefresh(`⚠️ UPDATE: ${contract.name.toUpperCase()} TIMER RESET`); 
    }
  };

  const handlePaid = async () => {
    if(confirm(`Clear all debt?`)) {
        await updateContract(contract.id, 0, true);
        
        sendSystemEmail('PAID', { ...contract, debt: 0, days: 0 }, showToast, true);

        showToast("Debt Cleared!", "SUCCESS");
        onClose();
        onRefresh(`💸 BREAKING: ${contract.name.toUpperCase()} IS DEBT FREE`);
    }
  };

  const handleDelete = async () => {
    if(confirm(`DELETE ${contract.name} FOREVER?`)) {
        await deleteContract(contract.id);
        showToast("Contract Deleted", "ERROR");
        onClose();
        onRefresh(`🗑️ SYSTEM: CONTRACT FOR ${contract.name.toUpperCase()} TERMINATED`);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{color: '#ffd700', marginTop: 0}}>{contract.name}</h2>
        <p style={{color: '#888'}}>Choose an action:</p>
        
        <button onClick={handleReset} className="action-btn" style={{marginBottom: '10px', background: '#333'}}>
           ⏳ RESET TIMER (Save Interest)
        </button>
        
        <button onClick={handlePaid} className="action-btn" style={{marginBottom: '10px', background: '#004d40', color: '#00e676'}}>
           💸 PAID IN FULL
        </button>
        
        <div style={{margin: '20px 0', borderTop: '1px solid #333'}}></div>
        
        <button onClick={handleDelete} style={{background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', marginBottom:'10px'}}>
           🗑️ DELETE CONTRACT
        </button>
        
        <button onClick={onClose} style={{background: '#222', color: '#fff'}}>CANCEL</button>
      </div>
    </div>
  );
};

// Simple Styles for the Modal
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalStyle = {
  background: '#111', padding: '25px', borderRadius: '12px',
  width: '90%', maxWidth: '400px', border: '1px solid #333', textAlign: 'center'
};

export default SettleModal;
