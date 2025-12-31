// src/utils/gameLogic.js

export const calculateDebt = (contract) => {
    if (!contract.lastInteraction) return { totalDebt: 0, daysMissed: 0 };
    
    // Handle Firestore Timestamp conversion if needed
    const lastInteraction = contract.lastInteraction.toDate ? contract.lastInteraction.toDate() : new Date(contract.lastInteraction);
    
    const now = new Date();
    const diffTime = Math.abs(now - lastInteraction);
    const daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
        totalDebt: (contract.baseDebt || 0) + daysMissed,
        daysMissed: daysMissed,
        limit: contract.bankruptcyLimit || 50
    };
};

export const getHunterRank = (debt) => {
    // Note: In React we return strings or JSX, usually strings for innerHTML is risky, 
    // but for now let's just return the text/class logic.
    if (debt === 0) return { label: 'CLEAN RECORD', color: '#00C851' };
    if (debt < 10) return { label: 'ROOKIE', color: '#aaa' };
    if (debt < 30) return { label: 'NEN USER', color: '#ffd700' };
    if (debt < 50) return { label: 'PHANTOM TROUPE', color: '#ff8800' };
    return { label: 'CHIMERA ANT', color: '#ff4444' };
};

export const calculateCreditScore = (debt, days) => {
    let score = 850; 
    score -= (days * 10); 
    score -= (debt * 2);  
    return Math.max(300, score);
};
