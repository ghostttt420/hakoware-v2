import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const HamburgerMenu = ({ onAddFriend, onRefresh }) => {
  const { user, logout, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: userProfile?.avatar ? 'transparent' : 'linear-gradient(135deg, #333 0%, #111 100%)',
          border: '2px solid #444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: '#fff'
        }}>
          {userProfile?.avatar ? (
            <img 
              src={userProfile.avatar} 
              alt={user?.displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          ) : (
            getInitials(user?.displayName || user?.email)
          )}
        </div>

        {/* Hamburger Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            width: '20px',
            height: '2px',
            background: isOpen ? '#ffd700' : '#666',
            transition: 'all 0.3s',
            transform: isOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none'
          }} />
          <span style={{
            width: '20px',
            height: '2px',
            background: isOpen ? '#ffd700' : '#666',
            transition: 'all 0.3s',
            opacity: isOpen ? 0 : 1
          }} />
          <span style={{
            width: '20px',
            height: '2px',
            background: isOpen ? '#ffd700' : '#666',
            transition: 'all 0.3s',
            transform: isOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none'
          }} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '10px',
          background: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '10px',
          minWidth: '220px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          zIndex: 1000,
          animation: 'slideDown 0.2s ease-out'
        }}>
          {/* User Info */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #222',
            marginBottom: '10px'
          }}>
            <div style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
              {user?.displayName}
            </div>
            <div style={{ color: '#666', fontSize: '0.8rem' }}>
              {user?.email}
            </div>
            {userProfile?.auraScore && (
              <div style={{ 
                color: '#ffd700', 
                fontSize: '0.75rem', 
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>✨</span>
                <span>Aura Score: {userProfile.auraScore}</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <button
            onClick={() => { onAddFriend(); setIsOpen(false); }}
            style={menuItemStyle}
          >
            <span>👤</span>
            <span>Add Friend</span>
          </button>

          <button
            onClick={() => { onRefresh(); setIsOpen(false); }}
            style={menuItemStyle}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>

          <div style={{ borderTop: '1px solid #222', margin: '10px 0' }} />

          <button
            onClick={handleLogout}
            style={{
              ...menuItemStyle,
              color: '#ff4444'
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const menuItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 15px',
  background: 'transparent',
  border: 'none',
  color: '#aaa',
  fontSize: '0.9rem',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.2s',
  textAlign: 'left'
};

// Hover effect via inline style won't work, use CSS-in-JS approach
const MenuItem = ({ children, onClick, danger }) => (
  <button
    onClick={onClick}
    onMouseEnter={(e) => {
      e.target.style.background = '#222';
      e.target.style.color = danger ? '#ff4444' : '#fff';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'transparent';
      e.target.style.color = danger ? '#ff4444' : '#aaa';
    }}
    style={{
      ...menuItemStyle,
      color: danger ? '#ff4444' : '#aaa'
    }}
  >
    {children}
  </button>
);

export default HamburgerMenu;
