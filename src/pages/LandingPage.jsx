import { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onEnter }) => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: "HAKOWARE",
      subtitle: "CHAPTER 7: BANKRUPTCY",
      content: (
        <>
          <p className="hero-text">
            The world's first <span className="highlight">social accountability</span> platform 
            that turns ghosting your friends into a literal debt crisis.
          </p>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-number">+1</span>
              <span className="stat-label">APR Per Day Ghosted</span>
            </div>
            <div className="stat">
              <span className="stat-number">B</span>
              <span className="stat-label">Bankruptcy Awaits</span>
            </div>
          </div>
        </>
      )
    },
    {
      title: "HOW IT WORKS",
      subtitle: "THE RULES OF ENGAGEMENT",
      content: (
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-icon">👻</div>
            <h3>Add Friends</h3>
            <p>Connect with people you actually want to stay in touch with.</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon">⏰</div>
            <h3>Set Your Limit</h3>
            <p>How many days of silence before they start accumulating debt?</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon">APR</div>
            <h3>Interest Accrues</h3>
            <p>Miss the limit? +1 APR (Aura Payable Rate) per day.</p>
          </div>
          <div className="rule-card">
            <div className="rule-icon">CH7</div>
            <h3>Face Bankruptcy</h3>
            <p>Hit the threshold? Official bankruptcy. Beg for mercy or pay up.</p>
          </div>
        </div>
      )
    },
    {
      title: "CHECK IN",
      subtitle: "STAY SOLVENT",
      content: (
        <>
          <p className="hero-text">
            Every day you check in resets the timer. Keep your streak alive, 
            reduce your debt, and avoid the dreaded <span className="highlight-red">Chapter 7</span>.
          </p>
          <div className="feature-list">
            <div className="feature">✓ Daily check-ins reduce debt</div>
            <div className="feature">✓ Build streaks with friends</div>
            <div className="feature">✓ Track your friendship history</div>
            <div className="feature">✓ Bail out bankrupt friends</div>
          </div>
        </>
      )
    },
    {
      title: "THE CONSEQUENCES",
      subtitle: "BANKRUPTCY IS REAL",
      content: (
        <>
          <p className="hero-text">
            When you hit bankruptcy, everyone knows. Your friends get notified. 
            You get an official-looking debt collection email. 
            You can <span className="highlight">beg for aura</span> or face social exile.
          </p>
          <div className="consequence-cards">
            <div className="consequence warning">
              <span className="consequence-icon">WARN</span>
              <span>Warning emails before bankruptcy</span>
            </div>
            <div className="consequence danger">
              <span className="consequence-icon">EMAIL</span>
              <span>Official bankruptcy notices sent</span>
            </div>
            <div className="consequence shame">
              <span className="consequence-icon">📢</span>
              <span>Public bankruptcy wall</span>
            </div>
          </div>
        </>
      )
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="landing-container">
      {/* Background Effects */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>
      
      {/* Header - minimal */}
      <header className="landing-header">
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="content-wrapper">
          <div className="section-number">
            0{currentSection + 1} / 0{sections.length}
          </div>
          
          <h1 className="section-title glitch" data-text={sections[currentSection].title}>
            {sections[currentSection].title}
          </h1>
          
          <p className="section-subtitle">
            {sections[currentSection].subtitle}
          </p>
          
          <div className="section-content">
            {sections[currentSection].content}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <div className="landing-nav">
        <button 
          className="nav-btn" 
          onClick={prevSection}
          disabled={currentSection === 0}
        >
          ← PREV
        </button>
        
        <div className="nav-dots">
          {sections.map((_, idx) => (
            <button
              key={idx}
              className={`nav-dot ${idx === currentSection ? 'active' : ''}`}
              onClick={() => setCurrentSection(idx)}
            />
          ))}
        </div>
        
        {currentSection < sections.length - 1 ? (
          <button className="nav-btn" onClick={nextSection}>
            NEXT →
          </button>
        ) : (
          <button className="nav-btn cta" onClick={onEnter}>
            ENTER THE VOID →
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="ticker">
          <span>FAILURE TO PAY WILL RESULT IN EXCOMMUNICATION • </span>
          <span>INTEREST COMPOUNDS DAILY • </span>
          <span>BANKRUPTCY IS FOREVER • </span>
          <span>CHECK IN OR CHECK OUT • </span>
          <span>FAILURE TO PAY WILL RESULT IN EXCOMMUNICATION • </span>
          <span>INTEREST COMPOUNDS DAILY • </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
