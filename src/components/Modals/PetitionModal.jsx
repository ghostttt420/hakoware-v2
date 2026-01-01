import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';
import { calculateDebt } from '../../utils/gameLogic';

const PetitionModal = ({ isOpen, onClose, contract, showToast }) => {
  if (!isOpen || !contract) return null;

  const [btnText, setBtnText] = useState("📱 Share Image");
  const cardRef = useRef(null); // The invisible HTML card
  
  const stats = calculateDebt(contract);
  const isBankrupt = stats.totalDebt >= stats.limit;
  const isClean = stats.totalDebt === 0;

  // --- 1. IMAGE GENERATOR LOGIC ---
  const handleShare = async () => {
    setBtnText("Generating...");
    if (cardRef.current) {
        try {
            const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
            canvas.toBlob(async (blob) => {
                const file = new File([blob], "status.png", { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Hakoware Status' });
                } else {
                    const link = document.createElement('a');
                    link.download = 'status.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
                setBtnText("📱 Share Image");
            });
        } catch (e) {
    showToast("Image Gen Failed", "ERROR"); // New way
    console.error(e);
    setBtnText("Error");
}

    }
  };

  // --- 2. EMAIL LOGIC ---
  const handleEmail = () => {
      const SERVICE_ID = "service_ciiisv3"; 
      const TEMPLATE_ID = "template_c3miqvi";
      const PUBLIC_KEY = "ePT35yP8-YeX6Ad7n";

      // 1. Determine Dynamic Variables based on status
      let emailParams = {
          to_email: "hakoware265@gmail.com",
          to_name: "Hakoware Admin", // Sending TO the Admin
          debt: stats.totalDebt,
          days: stats.daysMissed,
          // Default: Active Vow (Green)
          theme_color: "#00e676", 
          title: "OFFICIAL VOW",
          message_intro: "I vow to pay my debts. Please accept this digital pledge.",
          status_text: "ACTIVE CONTRACT",
          status_label: "GOOD STANDING"
      };

      // 2. Overwrite if Bankrupt (Red)
      if (isBankrupt) {
          emailParams.theme_color = "#ff4444";
          emailParams.title = "CHAPTER 7 PETITION";
          emailParams.message_intro = "I am insolvent and begging for mercy. The interest is too high.";
          emailParams.status_text = "BANKRUPTCY DECLARED";
          emailParams.status_label = "COLLECTION NOTICE";
      }

      // 3. Send to EmailJS
      setBtnText("Sending...");
      emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY)
      .then(() => {
          showToast("Official Petition Sent", "MERCY");
          setBtnText("Email Sent ✅");
      })
      .catch((e) => {
          console.error("Email Error:", e);
          showToast("Email Failed: " + e.text, "ERROR"); // Shows exact error from EmailJS
          setBtnText("Retry Email");
      });
  };

  // --- DYNAMIC CONTENT ---
  let title = "OFFICIAL PLEDGE";
  let color = "#00e676"; // Green
  let mascot = "📜🧚";
  let excuse = "I vow to clear this debt.";

  if (isBankrupt) {
      title = "MERCY PETITION";
      color = "#ff4444"; // Red
      mascot = "🏳️👹";
      excuse = "I acknowledge my failure.";
  } else if (isClean) {
      title = "HUNTER LICENSE";
      color = "#33b5e5"; // Blue
      mascot = "💎✨";
      excuse = "Debt is a chain, and I have broken it.";
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{color: color, margin: '0 0 10px 0'}}>{title}</h2>
        <div style={{fontSize: '3rem', marginBottom: '10px'}}>{mascot}</div>
        
        <p style={{color: '#aaa', fontStyle: 'italic'}}>"{excuse}"</p>
        
        <button onClick={handleShare} className="action-btn" style={{marginBottom: '10px'}}>
           {btnText}
        </button>
        
        {!isClean && (
            <button onClick={handleEmail} style={{background: 'transparent', color: '#888', border: '1px solid #444', width: '100%', padding: '10px'}}>
               📧 Send Official Email
            </button>
        )}
        
        <button onClick={onClose} style={{marginTop: '20px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline'}}>
            Close
        </button>

        {/* --- HIDDEN TEMPLATE FOR IMAGE GEN --- */}
        <div ref={cardRef} style={{
            position: 'fixed', left: '-9999px', top: 0,
            width: '400px', height: '600px', padding: '40px',
            background: isBankrupt ? '#1a0000' : '#0a1a0a',
            border: `4px solid ${color}`,
            color: 'white', fontFamily: 'Courier New', textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            <div>
                <h2 style={{color: color, fontSize: '2rem', borderBottom: `2px solid ${color}`}}>{title}</h2>
                <p>HAKOWARE CONSUMER FINANCE</p>
            </div>
            <div>
                <div style={{fontSize: '5rem'}}>{mascot}</div>
                <h1>{contract.name}</h1>
                <h2 style={{fontSize: '3rem', color: color}}>{stats.totalDebt} APR</h2>
            </div>
            <div style={{border: `1px solid ${color}`, padding: '20px', background: 'rgba(0,0,0,0.3)'}}>
                "{excuse}"
            </div>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalStyle = {
  background: '#111', padding: '30px', borderRadius: '15px',
  width: '90%', maxWidth: '350px', border: '1px solid #333', textAlign: 'center'
};

export default PetitionModal;
