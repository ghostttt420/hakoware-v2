import emailjs from '@emailjs/browser';

// --- CONFIG ---
const SERVICE_ID = "service_ciiisv3"; 
const TEMPLATE_ID = "template_c3miqvi";
const PUBLIC_KEY = "ePT35yP8-YeX6Ad7n";
const ADMIN_EMAIL = "hakoware265@gmail.com";

// --- HELPER: GENERATE CONTENT ---
const generateEmailParams = (type, data) => {
    const timestamp = new Date().toLocaleString();

    // BASE PARAMS (Defaults)
    let params = {
        to_email: data.email, // Default to USER
        to_name: data.name || "User",
        from_name: "Hakoware System",
        theme_color: "#333", 
        title: "SYSTEM NOTIFICATION",
        status_label: "STATUS",
        status_text: "UPDATE",
        message_intro: `Timestamp: ${timestamp}`,
        message: data.message || "No content provided.",
        debt: data.debt || 0,
        days: data.days || 0
    };

    // --- SCENARIO 1: ADMIN PLEA (Dice Roll) ---
    // ONLY this goes to Admin
    if (type === 'PLEA') {
        params.to_email = ADMIN_EMAIL;
        params.to_name = "Admin";
        params.from_name = data.name;

        const roll = data.roll || 0;
        if (roll === 20) {
            params.theme_color = "#ffd700"; 
            params.title = "🌟 DIVINE PETITION";
            params.status_label = "FATE ROLL";
            params.status_text = "NATURAL 20";
            params.message_intro = "The user has invoked a Golden Clause.";
        } else if (roll === 1) {
            params.theme_color = "#ff4444"; 
            params.title = "🗑️ SILENCED PLEA";
            params.status_label = "FATE ROLL";
            params.status_text = "NATURAL 1";
            params.message_intro = "The user attempted to speak, but failed.";
        } else {
            params.theme_color = "#33b5e5"; 
            params.title = "OFFICIAL PETITION";
            params.status_label = "FATE ROLL";
            params.status_text = `${roll} / 20`;
            params.message_intro = "The user requests an audience.";
        }
    }

    // --- SCENARIO 2: RESET ("We Spoke") ---
    else if (type === 'RESET') {
        params.theme_color = "#ffd700"; // Gold/Yellow
        params.title = "INTERACTION LOGGED";
        params.status_label = "TIMER STATUS";
        params.status_text = "RESET";
        params.message_intro = "We spoke today. Your timer has been reset, but your debt remains.";
        
        params.message = `
        Greetings ${data.name},

        This is a confirmation that an interaction was logged. 
        The bankruptcy timer has been paused and reset.

        ------------------------------------------
        CURRENT STANDING
        ------------------------------------------
        TOTAL DEBT:      ${data.debt} Aura
        DAYS IGNORED:    0 Days (Reset)
        ------------------------------------------
        
        "Interest Compounding continues..."
        `;
    }

    // --- SCENARIO 3: FULLY CLEARED (Paid in Full) ---
    else if (type === 'CLEARED') {
        params.theme_color = "#00C851"; // Bright Green
        params.title = "DEBT CLEARED";
        params.status_label = "ACCOUNT STATUS";
        params.status_text = "PAID IN FULL";
        params.message_intro = "Your payment has been accepted. Balance wiped clean.";
        params.debt = 0;

        params.message = `
        Dear ${data.name},

        Your restoration is complete. All obligations to the court are null and void.

        ------------------------------------------
        FINAL CLOSING STATEMENT
        ------------------------------------------
        PREV DEBT:      ${data.debt} Aura
        PAYMENT:       -${data.amountPaid} Aura
        ------------------------------------------
        REMAINING:      0 Aura
        ------------------------------------------

        >>> ACCOUNT GOOD STANDING <<<
        `;
    }

    // --- SCENARIO 4: RESTORATION (Partial Payment) ---
    else if (type === 'RECEIPT') {
        const prevDebt = parseInt(data.debt);
        const paid = parseInt(data.amountPaid);
        const remaining = prevDebt - paid;
        const newBalance = remaining > 0 ? remaining : 0;

        params.theme_color = "#00e676"; // Matrix Green
        params.title = "AURA LEDGER UPDATE";
        params.status_label = "RESTORATION AMOUNT";
        params.status_text = `${paid} AURA`; 
        params.debt = newBalance; 

        params.message_intro = `Restoration confirmed for ${data.name}.`;
        
        params.message = `
        Greetings ${data.name},

        We have verified your partial contribution. 

        ------------------------------------------
        RESTORATION LOG
        ------------------------------------------
        PRIOR OBLIGATION:  ${prevDebt} Aura
        RESTORED:         -${paid} Aura
        ------------------------------------------
        CURRENT STANDING:  ${newBalance} Aura
        ------------------------------------------

        >>> BALANCE OUTSTANDING <<<
        `;
    }

    // --- SCENARIO 5: BANKRUPTCY NOTICE ---
    else if (type === 'BANKRUPTCY') {
        params.theme_color = "#ff4444"; // Red
        params.title = "CHAPTER 7 BANKRUPTCY";
        params.status_label = "COLLECTION NOTICE";
        params.status_text = "CRITICAL DEFICIT";
        params.message_intro = "Your interaction balance has reached a critical deficit.";
        
        params.message = `
        NOTICE TO ${data.name}:

        You have exceeded the allowable debt limit and failed to maintain contact.
        
        ------------------------------------------
        DEFAULT JUDGMENT
        ------------------------------------------
        TOTAL DEBT: ${data.debt} Aura
        STATUS:     INSOLVENT
        ------------------------------------------
        
        "Collection protocols initiated."
        `;
    }

    return params;
};

// --- MAIN SEND FUNCTION ---
export const sendSystemEmail = async (type, data, showToast, silent = false) => {
    if (!silent && showToast) showToast("Syncing Ledger...", "INFO");

    try {
        const params = generateEmailParams(type, data);
        
        // Safety: If it's not a PLEA, we need a user email
        if (type !== 'PLEA' && !params.to_email) {
            console.warn(`[EMAIL] Skipping ${type}: No user email found.`);
            return false;
        }

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY);
        
        if (!silent && showToast) showToast(`📧 ${type} Notification Sent`, "SUCCESS");
        console.log(`[EMAIL SERVICE] Sent type: ${type} to ${params.to_email}`);
        return true;
    } catch (error) {
        console.error("[EMAIL ERROR]", error);
        if (!silent && showToast) showToast("Email Failed (Check Console)", "ERROR");
        return false;
    }
};
