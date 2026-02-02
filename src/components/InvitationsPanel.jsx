import { useState, useEffect } from 'react';
import { getPendingInvitations, respondToInvitation } from '../services/friendshipService';
import { useAuth } from '../contexts/AuthContext';

const InvitationsPanel = ({ onUpdate }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const loadInvitations = async () => {
    setLoading(true);
    const data = await getPendingInvitations(user.uid);
    setInvitations(data);
    setLoading(false);
  };

  const handleRespond = async (invitationId, response) => {
    const result = await respondToInvitation(invitationId, response, user.uid);
    if (result.success) {
      await loadInvitations();
      if (onUpdate) onUpdate();
    }
  };

  const totalCount = invitations.received.length + invitations.sent.length;

  if (loading) return null;

  if (totalCount === 0) return null;

  return (
    <div style={containerStyle}>
      <button 
        onClick={() => setExpanded(!expanded)}
        style={headerStyle}
      >
        <span>📬 INVITATIONS</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {invitations.received.length > 0 && (
            <span style={badgeStyle}>{invitations.received.length}</span>
          )}
          <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </span>
      </button>

      {expanded && (
        <div style={contentStyle}>
          {/* Received Invitations */}
          {invitations.received.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>
                Received
              </h4>
              {invitations.received.map((invite) => (
                <div key={invite.id} style={inviteItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>
                      {invite.fromUser?.displayName || 'Unknown'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {invite.fromUser?.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleRespond(invite.id, 'accepted')}
                      style={acceptBtnStyle}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRespond(invite.id, 'declined')}
                      style={declineBtnStyle}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sent Invitations */}
          {invitations.sent.length > 0 && (
            <div>
              <h4 style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>
                Sent
              </h4>
              {invitations.sent.map((invite) => (
                <div key={invite.id} style={inviteItemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '600' }}>
                      {invite.toUser?.displayName || 'Unknown'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                      {invite.toEmail}
                    </div>
                  </div>
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>Pending...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  margin: '20px',
  background: '#111',
  border: '1px solid #333',
  borderRadius: '8px',
  overflow: 'hidden'
};

const headerStyle = {
  width: '100%',
  padding: '15px 20px',
  background: '#1a1a1a',
  border: 'none',
  color: '#fff',
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
  borderTop: '1px solid #222'
};

const inviteItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
  background: '#0a0a0a',
  borderRadius: '6px',
  marginBottom: '8px'
};

const acceptBtnStyle = {
  width: '32px',
  height: '32px',
  background: '#004d40',
  border: 'none',
  borderRadius: '6px',
  color: '#00e676',
  cursor: 'pointer',
  fontSize: '1rem'
};

const declineBtnStyle = {
  width: '32px',
  height: '32px',
  background: '#330000',
  border: 'none',
  borderRadius: '6px',
  color: '#ff4444',
  cursor: 'pointer',
  fontSize: '1rem'
};

export default InvitationsPanel;
