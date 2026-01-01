import { updateContract, deleteContract } from '../../services/firebase';

// Change the first line to this:
const SettleModal = ({ isOpen, onClose, contract, onRefresh, showToast }) => {

  // Update handleReset
  const handleReset = async () => {
    if(confirm(`Reset timer for ${contract.name}?`)) {
        await updateContract(contract.id, contract.baseDebt, true);
        showToast("Interest Saved!", "SUCCESS"); // <--- NEW
        onClose();
        onRefresh();
    }
  };

  // Update handlePaid
  const handlePaid = async () => {
    if(confirm(`Clear all debt?`)) {
        await updateContract(contract.id, 0, true);
        showToast("Debt Cleared!", "SUCCESS"); // <--- NEW
        onClose();
        onRefresh();
    }
  };

  


  const handleDelete = async () => {
    if(confirm(`DELETE ${contract.name} FOREVER?`)) {
        await deleteContract(contract.id);
        onClose();
        onRefresh();
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
