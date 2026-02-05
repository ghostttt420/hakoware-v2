import { useState, useEffect, useRef } from 'react'
import { useAuth } from './contexts/AuthContext'
import { getUserFriendships } from './services/friendshipService'
import { sendSystemEmail } from './services/emailService'
import { getRandomQuote } from './utils/quotes' 
import './index.css' 
import { calculateDebt } from './utils/gameLogic'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import VerificationRequired from './pages/auth/VerificationRequired'

// Components
import Dashboard from './components/Dashboard'
import NenCard from './components/NenCard'
import InvitationsPanel from './components/InvitationsPanel'
import MercyPanel from './components/MercyPanel'
import HamburgerMenu from './components/HamburgerMenu'
import AuraMarketplaceModal from './components/Modals/AuraMarketplaceModal'
import AdminPanel from './components/AdminPanel'
import AdminLock from './components/AdminLock'
import Toast from './components/Toast'
import AddFriendModal from './components/Modals/AddFriendModal'
import CheckinModal from './components/Modals/CheckinModal'
import MercyRequestModal from './components/Modals/MercyRequestModal'
import BailoutModal from './components/Modals/BailoutModal'
import SettleModal from './components/Modals/SettleModal'
import PetitionModal from './components/Modals/PetitionModal'

function App() {
  const { user, isAuthenticated, isEmailVerified } = useAuth();
  const [hasEntered, setHasEntered] = useState(() => {
    return localStorage.getItem('hakoware_visited') === 'true';
  });
  const [showSignup, setShowSignup] = useState(false);

  const handleEnter = () => {
    localStorage.setItem('hakoware_visited', 'true');
    setHasEntered(true);
  };
  
  // App state
  const [friendships, setFriendships] = useState([])
  const [loading, setLoading] = useState(true)
  
  // --- AUTH STATE ---
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUnlocked, setAdminUnlocked] = useState(false)

  // --- UI STATE ---
  const [selectedFriendship, setSelectedFriendship] = useState(null)
  const [modalType, setModalType] = useState(null) 
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [toast, setToast] = useState(null)
  const [recentActivity, setRecentActivity] = useState("SYSTEM: MONITORING TRANSACTIONS...");

  const sfxReset = useRef(new Audio('https://www.myinstants.com/media/sounds/discord-notification.mp3'));

  // Check for admin mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') setIsAdmin(true);
  }, []);

  const showToast = (msg, type = 'SUCCESS') => {
      setToast({ msg, type });
  };

  const loadData = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
        // Load friendships using the new service
        const userFriendships = await getUserFriendships(user.uid);
        
        // Calculate total APR for sorting
        const friendshipsWithStats = userFriendships.map(f => {
          const isUser1 = f.myPerspective === 'user1';
          const myData = isUser1 ? f.user1Perspective : f.user2Perspective;
          const stats = calculateDebt({
            baseDebt: myData.baseDebt,
            lastInteraction: myData.lastInteraction,
            bankruptcyLimit: myData.limit
          });
          return { ...f, myDebt: stats.totalDebt };
        });

        // Sort by urgency (highest debt first)
        const sorted = friendshipsWithStats.sort((a, b) => b.myDebt - a.myDebt);
        setFriendships(sorted);
        setLoading(false);
    } catch (e) {
        console.error(e);
        showToast("Database Error", "ERROR");
        setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [isAuthenticated, user]) 

  // --- HANDLERS ---

  const handlePoke = (name, isBankrupt, isClean) => {
      sfxReset.current.volume = 0.5;
      sfxReset.current.currentTime = 0;
      sfxReset.current.play().catch(e => console.log("Audio Blocked:", e));
      
      const msg = getRandomQuote(isBankrupt, isClean);
      const type = isBankrupt ? "ERROR" : isClean ? "SUCCESS" : "INFO";
      
      showToast(msg, type);
  };

  const handleAction = (type, friendship) => {
      // SECURITY CHECK: If Admin is present but locked, BLOCK EVERYTHING
      if (isAdmin && !adminUnlocked) {
          showToast("SYSTEM LOCKED: ENTER PIN", "ERROR");
          return;
      }

      setSelectedFriendship(friendship);
      
      if (type === 'CHECKIN') {
        setModalType('CHECKIN');
      } else if (type === 'BEG') {
        setModalType('MERCY_REQUEST');
      } else if (type === 'BAILOUT') {
        setModalType('BAILOUT');
      } else if (type === 'SETTINGS') {
        // TODO: Implement friendship settings
        showToast("Settings feature coming soon!", "INFO");
      }
  };

  const handleRefreshData = (actionMsg) => {
      if(actionMsg) setRecentActivity(actionMsg); 
      loadData(); 
  };

  const closeModal = () => {
      setSelectedFriendship(null);
      setModalType(null);
  };

  // Show landing page if first visit
  if (!hasEntered) {
    return <LandingPage onEnter={handleEnter} />;
  }

  // Show auth screens if not logged in
  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onToggle={() => setShowSignup(false)} />
    ) : (
      <Login onToggle={() => setShowSignup(true)} />
    );
  }

  // Show verification required screen if email not verified
  if (!isEmailVerified()) {
    return <VerificationRequired />;
  }

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 30px',
        marginBottom: '20px',
        borderBottom: '1px solid #222'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'left' }}>
          <h1 className="glitch" data-text="HAKOWARE" style={{margin: 0, fontSize: '1.5rem', letterSpacing: '4px'}}>
            HAKOWARE 
          </h1>
          <div className="sub-header" style={{fontSize: '0.7rem', marginTop: '2px'}}>
            CHAPTER 7 BANKRUPTCY
          </div>
        </div>

        {/* Hamburger Menu */}
        <HamburgerMenu 
          onAddFriend={() => setShowAddFriend(true)}
          onRefresh={loadData}
          onOpenMarketplace={() => setShowMarketplace(true)}
        />
      </header>

      {/* Invitations & Mercy Panels */}
      <InvitationsPanel onUpdate={loadData} />
      <MercyPanel onUpdate={loadData} />

      {/* Stats Dashboard */}
      {!loading && <Dashboard friendships={friendships} recentActivity={recentActivity} />}
      
      {/* --- ADMIN LOCK SYSTEM --- */}
      {isAdmin && (
          !adminUnlocked ? (
              <AdminLock onUnlock={() => {
                  setAdminUnlocked(true);
                  showToast("ADMIN PRIVILEGES GRANTED", "SUCCESS");
              }} />
          ) : (
              <AdminPanel onRefresh={() => handleRefreshData("SYSTEM: NEW CONTRACT ISSUED")} />
          )
      )}

      {loading ? (
        <div style={{color: 'white', textAlign: 'center', marginTop: '50px', fontFamily: 'Courier New'}}>
            Connecting to Nen Network...
        </div>
      ) : friendships.length === 0 ? (
        <div style={{
          color: '#666', 
          textAlign: 'center', 
          marginTop: '50px', 
          fontFamily: 'Courier New',
          padding: '40px'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>No friendships yet.</p>
          <p>Click "+ Add Friend" to get started!</p>
        </div>
      ) : (
        <div className="grid-container">
          {friendships.map((friendship, index) => (
            <NenCard 
              key={friendship.id}
              friendship={friendship}
              currentUserId={user.uid}
              index={index}
              isAdmin={isAdmin && adminUnlocked}
              onAction={handleAction}
              onPoke={handlePoke}
            />
          ))}
        </div>
      )}

      {/* --- MODALS --- */}
      <AddFriendModal 
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        showToast={showToast}
      />

      {(isAdmin && adminUnlocked) && (
        <SettleModal 
            isOpen={modalType === 'SETTLE'} 
            contract={selectedFriendship} 
            onClose={closeModal} 
            onRefresh={handleRefreshData} 
            showToast={showToast} 
        />
      )}
      
      <CheckinModal
        isOpen={modalType === 'CHECKIN'}
        onClose={closeModal}
        friendship={selectedFriendship}
        showToast={showToast}
        onCheckinComplete={loadData}
      />

      <MercyRequestModal
        isOpen={modalType === 'MERCY_REQUEST'}
        onClose={closeModal}
        friendship={selectedFriendship}
        showToast={showToast}
        onRequestComplete={loadData}
      />

      <BailoutModal
        isOpen={modalType === 'BAILOUT'}
        onClose={closeModal}
        friendship={selectedFriendship}
        showToast={showToast}
        onBailoutComplete={loadData}
      />

      <AuraMarketplaceModal
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        onBailout={(friendship) => {
          setShowMarketplace(false);
          handleAction('BAILOUT', friendship);
        }}
      />

      <PetitionModal 
          isOpen={modalType === 'PETITION'} 
          contract={selectedFriendship} 
          onClose={closeModal}
          showToast={showToast}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App
