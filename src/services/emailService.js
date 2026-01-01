import emailjs from '@emailjs/browser';

const EMAIL_SERVICE = "service_ciiisv3";
const EMAIL_TEMPLATE = "template_c3miqvi";
const PUBLIC_KEY = "ePT35yP8-YeX6Ad7n";

/**
 * Unified System Email Handler
 * @param {string} type - 'BANKRUPTCY', 'RESET', or 'PAID'
 * @param {object} data - { name, email, debt, days }
 * @param {function} showToast - (Optional) Function to show notifications
 * @param {boolean} isAdmin - (Optional) If true, shows debug toasts
 */
export const sendSystemEmail = (type, data, showToast = null, isAdmin = false) => {
    // 1. Validation
    if (!data.email || data.email === "undefined" || data.email === "") {
        console.warn(`[Email Service] Skipping ${type}: No email found for ${data.name}`);
        return; 
    }

    const params = {
        to_name: data.name,
        to_email: data.email,
        debt: data.debt,
        days: data.days,
        theme_color: "#ffffff",
        title: "NOTICE",
        message_intro: "",
        status_text: "",
        status_label: "ACTIVE"
    };

    // 2. Configure Content based on Type
    switch(type) {
        case 'BANKRUPTCY':
            params.theme_color = "#ff4444"; 
            params.title = "CHAPTER 7 BANKRUPTCY";
            params.message_intro = "Your interaction balance has reached a critical deficit.";
            params.status_text = "COLLECTION NOTICE";
            params.status_label = "TORITATEN (Collection)";
            break;
        case 'RESET':
            params.theme_color = "#ffd700"; 
            params.title = "INTERACTION LOGGED";
            params.message_intro = "We spoke today. Your timer has been reset, but your debt remains.";
            params.status_text = "TIMER RESET";
            params.status_label = "INTEREST COMPOUNDING";
            break;
        case 'PAID':
            params.theme_color = "#00C851"; 
            params.title = "DEBT CLEARED";
            params.message_intro = "Your payment has been accepted. Balance wiped clean.";
            params.status_text = "PAID IN FULL";
            params.status_label = "GOOD STANDING";
            params.debt = 0; 
            break;
        default:
            return;
    }

    // 3. Send Email
    emailjs.send(EMAIL_SERVICE, EMAIL_TEMPLATE, params, PUBLIC_KEY)
        .then(() => {
            console.log(`[System] ${type} email sent to ${data.email}`);

            // --- PROFESSIONAL FIX: ONLY NOTIFY IF ADMIN ---
            if (isAdmin && showToast) {
                showToast(`📧 ${type} Notification Sent!`, "INFO");
            }
        })
        .catch(e => {
            console.error("System Email Failed:", e);
            if (isAdmin && showToast) {
                showToast("⚠️ Email Failed (Check Console)", "ERROR");
            }
        });
};
