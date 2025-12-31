// Pure logic functions - No React code here

export const calculateDebt = (contract) => {
    if (!contract.lastInteraction) return { totalDebt: 0, daysMissed: 0, limit: 50 };
    
    // Handle Firestore Timestamp vs Date object
    let lastInteraction;
    if (contract.lastInteraction.toDate) {
        lastInteraction = contract.lastInteraction.toDate();
    } else {
        lastInteraction = new Date(contract.lastInteraction);
    }
    
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
    if (debt === 0) return 'CLEAN RECORD';
    if (debt < 10) return 'ROOKIE';
    if (debt < 30) return 'NEN USER';
    if (debt < 50) return 'PHANTOM TROUPE';
    return 'CHIMERA ANT';
};

export const calculateCreditScore = (debt, days) => {
    let score = 850; 
    score -= (days * 10); 
    score -= (debt * 2);  
    return Math.max(300, score);
};
