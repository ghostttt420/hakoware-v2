/**
 * Aura Economy Service
 * 
 * Aura Balance = Spendable currency
 * Aura Score = Credit score (300-850, separate system)
 * 
 * Features:
 * - Balance tracking
 * - Transactions (earn/spend)
 * - Aura utility purchases
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

const AURA_BALANCES_COLLECTION = 'auraBalances';
const AURA_TRANSACTIONS_COLLECTION = 'auraTransactions';

// Initialize user aura balance
export const initializeAuraBalance = async (userId) => {
  try {
    const balanceRef = doc(db, AURA_BALANCES_COLLECTION, userId);
    const balanceDoc = await getDoc(balanceRef);
    
    if (!balanceDoc.exists()) {
      // New users start with 100 Aura
      await setDoc(balanceRef, {
        userId,
        balance: 100,
        totalEarned: 100,
        totalSpent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Record initial grant
      await addDoc(collection(db, AURA_TRANSACTIONS_COLLECTION), {
        userId,
        type: 'initial_grant',
        amount: 100,
        description: 'Welcome to the Aura Economy',
        timestamp: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing aura balance:', error);
    return { success: false, error: error.message };
  }
};

// Get user aura balance
export const getAuraBalance = async (userId) => {
  try {
    const balanceRef = doc(db, AURA_BALANCES_COLLECTION, userId);
    const balanceDoc = await getDoc(balanceRef);
    
    if (!balanceDoc.exists()) {
      await initializeAuraBalance(userId);
      return { balance: 100, totalEarned: 100, totalSpent: 0 };
    }
    
    const data = balanceDoc.data();
    return {
      balance: data.balance || 0,
      totalEarned: data.totalEarned || 0,
      totalSpent: data.totalSpent || 0
    };
  } catch (error) {
    console.error('Error getting aura balance:', error);
    return { balance: 0, totalEarned: 0, totalSpent: 0 };
  }
};

// Add aura to balance (earning)
export const addAura = async (userId, amount, type, description, metadata = {}) => {
  try {
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    
    const balanceRef = doc(db, AURA_BALANCES_COLLECTION, userId);
    
    // Update balance
    await updateDoc(balanceRef, {
      balance: increment(amount),
      totalEarned: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    // Record transaction
    const transactionRef = await addDoc(collection(db, AURA_TRANSACTIONS_COLLECTION), {
      userId,
      type,
      amount,
      description,
      metadata,
      timestamp: serverTimestamp()
    });
    
    return { 
      success: true, 
      transactionId: transactionRef.id,
      message: `+${amount} Aura earned!` 
    };
  } catch (error) {
    console.error('Error adding aura:', error);
    return { success: false, error: error.message };
  }
};

// Deduct aura from balance (spending)
export const spendAura = async (userId, amount, type, description, metadata = {}) => {
  try {
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    
    // Check balance first
    const currentBalance = await getAuraBalance(userId);
    if (currentBalance.balance < amount) {
      return { 
        success: false, 
        error: `Insufficient Aura balance. Need ${amount}, have ${currentBalance.balance}` 
      };
    }
    
    const balanceRef = doc(db, AURA_BALANCES_COLLECTION, userId);
    
    // Deduct balance
    await updateDoc(balanceRef, {
      balance: increment(-amount),
      totalSpent: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    // Record transaction
    const transactionRef = await addDoc(collection(db, AURA_TRANSACTIONS_COLLECTION), {
      userId,
      type,
      amount: -amount,
      description,
      metadata,
      timestamp: serverTimestamp()
    });
    
    return { 
      success: true, 
      transactionId: transactionRef.id,
      remainingBalance: currentBalance.balance - amount,
      message: `-${amount} Aura spent` 
    };
  } catch (error) {
    console.error('Error spending aura:', error);
    return { success: false, error: error.message };
  }
};

// Get transaction history
export const getAuraTransactions = async (userId, limit_count = 50) => {
  try {
    const q = query(
      collection(db, AURA_TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error getting aura transactions:', error);
    return [];
  }
};

// EARN AURA - Achievement unlocked
export const earnAuraFromAchievement = async (userId, achievementId, points) => {
  return addAura(
    userId,
    points,
    'achievement',
    `Achievement unlocked: ${achievementId}`,
    { achievementId, points }
  );
};

// EARN AURA - Streak milestone
export const earnAuraFromStreak = async (userId, streakDays) => {
  const amount = streakDays * 5; // 5 Aura per streak day
  return addAura(
    userId,
    amount,
    'streak_bonus',
    `${streakDays}-day streak bonus`,
    { streakDays, amount }
  );
};

// EARN AURA - Check-in
export const earnAuraFromCheckin = async (userId, friendshipId) => {
  return addAura(
    userId,
    5,
    'checkin',
    'Daily check-in completed',
    { friendshipId }
  );
};

// EARN AURA - Bounty claimed
export const earnAuraFromBounty = async (userId, bountyId, amount) => {
  return addAura(
    userId,
    amount,
    'bounty_claimed',
    'Bounty claimed successfully',
    { bountyId, amount }
  );
};

// SPEND AURA - Create bounty (holds in escrow conceptually)
export const spendAuraForBounty = async (userId, bountyId, amount) => {
  return spendAura(
    userId,
    amount,
    'bounty_created',
    `Placed bounty #${bountyId}`,
    { bountyId, amount }
  );
};

// SPEND AURA - Debt Roulette
export const spendAuraForRoulette = async (userId) => {
  return spendAura(
    userId,
    10,
    'roulette_spin',
    'Spun the Debt Roulette',
    { cost: 10 }
  );
};

// SPEND AURA - Extend Grace Period
export const spendAuraForGraceExtension = async (userId, friendshipId) => {
  return spendAura(
    userId,
    20,
    'grace_extension',
    'Extended grace period by 3 days',
    { friendshipId, days: 3 }
  );
};

// SPEND AURA - Nen Shield (Bankruptcy Protection)
export const spendAuraForShield = async (userId, friendshipId) => {
  return spendAura(
    userId,
    50,
    'nen_shield',
    'Activated Nen Shield (24h bankruptcy protection)',
    { friendshipId, duration: '24h' }
  );
};

// SPEND AURA - Custom Status
export const spendAuraForCustomStatus = async (userId, statusMessage) => {
  return spendAura(
    userId,
    5,
    'custom_status',
    'Set custom flex status',
    { statusMessage }
  );
};

// Refund aura (for cancelled bounties, etc.)
export const refundAura = async (userId, amount, reason, metadata = {}) => {
  return addAura(
    userId,
    amount,
    'refund',
    reason,
    metadata
  );
};

// Get top aura holders leaderboard
export const getAuraLeaderboard = async (limit_count = 10) => {
  try {
    // Query all balances and sort
    const q = query(
      collection(db, AURA_BALANCES_COLLECTION),
      orderBy('balance', 'desc'),
      limit(limit_count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting aura leaderboard:', error);
    return [];
  }
};

// Get aura stats for user
export const getAuraStats = async (userId) => {
  try {
    const balance = await getAuraBalance(userId);
    const transactions = await getAuraTransactions(userId, 100);
    
    // Calculate stats
    const earnings = transactions.filter(t => t.amount > 0);
    const spendings = transactions.filter(t => t.amount < 0);
    
    const stats = {
      currentBalance: balance.balance,
      totalEarned: balance.totalEarned,
      totalSpent: balance.totalSpent,
      totalTransactions: transactions.length,
      earningsByType: {},
      spendingsByType: {}
    };
    
    // Aggregate by type
    earnings.forEach(t => {
      stats.earningsByType[t.type] = (stats.earningsByType[t.type] || 0) + t.amount;
    });
    
    spendings.forEach(t => {
      stats.spendingsByType[t.type] = (stats.spendingsByType[t.type] || 0) + Math.abs(t.amount);
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting aura stats:', error);
    return null;
  }
};
