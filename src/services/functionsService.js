/**
 * Firebase Functions Service
 * 
 * Client-side interface to Firebase Functions
 * Replaces local calculations with server-side execution
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Calculate debt for a friendship (server-side)
 */
export const calculateDebtServer = async (friendshipId) => {
  try {
    const calculateDebtFn = httpsCallable(functions, 'calculateFriendshipDebt');
    const result = await calculateDebtFn({ friendshipId });
    return result.data;
  } catch (error) {
    console.error('Error calculating debt:', error);
    throw error;
  }
};

/**
 * Perform check-in via server function
 */
export const performCheckinServer = async (friendshipId, proof = null) => {
  try {
    const performCheckinFn = httpsCallable(functions, 'performCheckin');
    const result = await performCheckinFn({ friendshipId, proof });
    return result.data;
  } catch (error) {
    console.error('Error in server check-in:', error);
    throw error;
  }
};

/**
 * Get pre-calculated debt from friendship document
 * This reads the stored calculation from Firestore (no function call needed)
 */
export const getStoredDebt = (friendship, userId) => {
  if (!friendship || !userId) return null;
  
  const isUser1 = friendship.user1Id === userId;
  const perspective = isUser1 ? 'user1Perspective' : 'user2Perspective';
  const myData = friendship[perspective];
  
  if (!myData) return null;
  
  // Return stored calculation if available
  if (myData.calculatedDebt !== undefined) {
    return {
      totalDebt: myData.calculatedDebt,
      daysMissed: myData.daysMissed || 0,
      isBankrupt: myData.isBankrupt || false,
      isInWarningZone: myData.isInWarningZone || false,
      daysUntilBankrupt: myData.daysUntilBankrupt || 0,
      calculatedAt: myData.calculatedAt?.toDate?.() || null,
      isFromServer: true
    };
  }
  
  // Fallback to local calculation if server hasn't calculated yet
  return null;
};

/**
 * Check if debt calculation is fresh (within last hour)
 */
export const isDebtCalculationFresh = (friendship, userId) => {
  const debt = getStoredDebt(friendship, userId);
  if (!debt?.calculatedAt) return false;
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return debt.calculatedAt > oneHourAgo;
};
