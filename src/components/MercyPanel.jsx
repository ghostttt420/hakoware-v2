import { useState, useEffect } from 'react';
import { getPendingMercyRequests, respondToMercyRequest } from '../services/bankruptcyService';
import { useAuth } from '../contexts/AuthContext';

const MercyPanel = ({ onUpdate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState(null);
  const [condition, setCondition] = useState('');
  const [showConditionInput, setShowConditionInput] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getPendingMercyRequests(user.uid);
    setRequests(data);
    setLoading(false);
  };

  const handleResponse = async (requestId, response) => {
    if (response === 'countered') {
      setResponding(requestId);
      setShowConditionInput(true);
      return;
    }

    setResponding(requestId);
    const result = await respondToMercyRequest(requestId, response);
    setResponding(null);

    if (result.success) {
      await loadRequests();
      if (onUpdate) onUpdate();
    }
  };

  const handleCounterSubmit = async () => {
    if (!condition.trim()) return;

    setResponding('submitting');
    const result = await respondToMercyRequest(responding, 'countered', condition);
    setResponding(null);
    setShowConditionInput(false);
    setCondition('');

    if (result.success) {
      await loadRequests();
      if (onUpdate) onUpdate();
    }
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div style={containerStyle}>
      <button 
        onClick={() => setExpanded(!expanded)}
        style={headerStyle}
      >
        <span>🏳️ MERCY PETITIONS</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={badgeStyle}>{requests.length}</span>
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </span>
      </button>

      {expanded && (
        <div style={contentStyle}>
          {requests.map((request) => (
            <div key={request.id} style={requestItemStyle}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
                  {request.requesterName}
                </div>
                <div style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '4px' }}>
                  💀 BANKRUPT - Seeking mercy
                </div>
              </div>

              {request.message && (
                <div style={{
                  background: '#0a0a0a',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontStyle: 'italic',
                  color: '#aaa',
                  fontSize: '0.9rem',
                  borderLeft: '3px solid #ff4444'
                }}>
                  "{request.message}"
                </div>
              )}

              {showConditionInput && responding === request.id ? (
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="e.g., Buy me lunch this week"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#0a0a0a',
                      border: '1px solid #ffd700',
                      borderRadius: '6px',
                      color: '#fff',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCounterSubmit}
                      disabled={responding === 'submitting'}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#443300',
                        color: '#ffd700',
                        border: '1px solid #ffd700',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {responding === 'submitting' ? 'Sending...' : 'Send Condition'}
                    </button>
                    <button
                      onClick={() => {
                        setShowConditionInput(false);
                        setResponding(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        color: '#888',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleResponse(request.id, 'granted')}
                    disabled={responding === request.id}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#004d40',
                      color: '#00e676',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    {responding === request.id ? '...' : 'GRANT MERCY'}
                  </button>
                  <button
                    onClick={() => handleResponse(request.id, 'countered')}
                    disabled={responding === request.id}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#443300',
                      color: '#ffd700',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    COUNTER
                  </button>
                  <button
                    onClick={() => handleResponse(request.id, 'declined')}
                    disabled={responding === request.id}
                    style={{
                      padding: '10px',
                      background: '#330000',
                      color: '#ff4444',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  margin: '20px',
  background: '#111',
  border: '1px solid #330000',
  borderRadius: '8px',
  overflow: 'hidden'
};

const headerStyle = {
  width: '100%',
  padding: '15px 20px',
  background: 'linear-gradient(135deg, #1a0000 0%, #220000 100%)',
  border: 'none',
  color: '#ff4444',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const badgeStyle = {
  background: '#ff4444',
  color: '#fff',
  fontSize: '0.75rem',
  padding: '2px 8px',
  borderRadius: '10px',
  fontWeight: 'bold'
};

const contentStyle = {
  padding: '20px',
  borderTop: '1px solid #220000'
};

const requestItemStyle = {
  background: '#0a0a0a',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '12px'
};

export default MercyPanel;
