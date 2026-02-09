/**
 * Firebase Functions for Hakoware
 * 
 * These functions handle:
 * - Daily debt accrual (scheduled)
 * - Debt calculation on check-in
 * - Bankruptcy detection
 * - Aura balance updates
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// ============================================================================
// SCHEDULED FUNCTIONS
// ============================================================================

/**
 * Daily debt accrual - runs every day at midnight
 * Calculates new debt for all friendships based on missed check-ins
 */
exports.dailyDebtAccrual = functions.pubsub
  .schedule('0 0 * * *') // Every day at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting daily debt accrual...');
    
    const now = admin.firestore.Timestamp.now();
    const batch = db.batch();
    let processedCount = 0;
    let bankruptcyCount = 0;
    
    try {
      // Get all active friendships
      const friendshipsSnapshot = await db.collection('friendships').get();
      
      for (const friendshipDoc of friendshipsSnapshot.docs) {
        const friendship = friendshipDoc.data();
        const friendshipRef = friendshipDoc.ref;
        
        // Process both perspectives
        const perspectives = ['user1', 'user2'];
        
        for (const perspective of perspectives) {
          const myData = friendship[`${perspective}Perspective`];
          if (!myData) continue;
          
          const userId = friendship[`${perspective}Id`];
          const friendId = friendship[`${perspective === 'user1' ? 'user2' : 'user1'}Id`];
          
          // Calculate current debt
          const debtStats = calculateDebt(myData, now);
          
          // Check for new bankruptcy
          if (debtStats.isBankrupt && !myData.wasBankrupt) {
            // Record bankruptcy
            const bankruptcyRef = db.collection('bankruptcyHistory').doc();
            batch.set(bankruptcyRef, {
              userId,
              friendId,
              friendshipId: friendshipDoc.id,
              debtAtBankruptcy: debtStats.totalDebt,
              declaredAt: now,
              resolvedAt: null,
              restoredAt: null
            });
            
            // Update friendship to mark as bankrupt
            batch.update(friendshipRef, {
              [`${perspective}Perspective.wasBankrupt`]: true,
              [`${perspective}Perspective.bankruptAt`]: now
            });
            
            bankruptcyCount++;
            
            // Create notification for friend
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
              toUserId: friendId,
              fromUserId: userId,
              type: 'BANKRUPTCY_DECLARED',
              message: `${friendship[`${perspective === 'user1' ? 'user2' : 'user1'}DisplayName']} has declared bankruptcy!`,
              createdAt: now,
              read: false
            });
          }
          
          // Store calculated stats for quick access
          batch.update(friendshipRef, {
            [`${perspective}Perspective.calculatedDebt`]: debtStats.totalDebt,
            [`${perspective}Perspective.calculatedAt`]: now,
            [`${perspective}Perspective.daysMissed`]: debtStats.daysMissed,
            [`${perspective}Perspective.isBankrupt`]: debtStats.isBankrupt,
            [`${perspective}Perspective.isInWarningZone`]: debtStats.isInWarningZone,
            [`${perspective}Perspective.daysUntilBankrupt`]: debtStats.daysUntilBankrupt
          });
          
          processedCount++;
        }
      }
      
      // Commit all updates
      await batch.commit();
      
      console.log(`Daily accrual complete. Processed: ${processedCount}, New bankruptcies: ${bankruptcyCount}`);
      return null;
      
    } catch (error) {
      console.error('Error in daily debt accrual:', error);
      throw error;
    }
  });

// ============================================================================
// HTTP FUNCTIONS (Callable from client)
// ============================================================================

/**
 * Calculate debt for a specific friendship
 * Called when client needs fresh calculation
 */
exports.calculateFriendshipDebt = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { friendshipId } = data;
  if (!friendshipId) {
    throw new functions.https.HttpsError('invalid-argument', 'friendshipId is required');
  }
  
  try {
    const friendshipDoc = await db.collection('friendships').doc(friendshipId).get();
    
    if (!friendshipDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Friendship not found');
    }
    
    const friendship = friendshipDoc.data();
    const now = admin.firestore.Timestamp.now();
    
    // Determine which perspective the caller is
    const isUser1 = friendship.user1Id === context.auth.uid;
    const perspective = isUser1 ? 'user1' : 'user2';
    const myData = friendship[`${perspective}Perspective`];
    
    if (!myData) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized for this friendship');
    }
    
    const debtStats = calculateDebt(myData, now);
    
    // Update stored calculation
    await friendshipDoc.ref.update({
      [`${perspective}Perspective.calculatedDebt`]: debtStats.totalDebt,
      [`${perspective}Perspective.calculatedAt`]: now,
      [`${perspective}Perspective.daysMissed`]: debtStats.daysMissed,
      [`${perspective}Perspective.isBankrupt`]: debtStats.isBankrupt,
      [`${perspective}Perspective.isInWarningZone`]: debtStats.isInWarningZone,
      [`${perspective}Perspective.daysUntilBankrupt`]: debtStats.daysUntilBankrupt
    });
    
    return debtStats;
    
  } catch (error) {
    console.error('Error calculating debt:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Perform check-in via function (more secure than client-side)
 */
exports.performCheckin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { friendshipId, proof } = data;
  
  try {
    const friendshipRef = db.collection('friendships').doc(friendshipId);
    const friendshipDoc = await friendshipRef.get();
    
    if (!friendshipDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Friendship not found');
    }
    
    const friendship = friendshipDoc.data();
    
    // Verify user is part of this friendship
    const isUser1 = friendship.user1Id === context.auth.uid;
    const isUser2 = friendship.user2Id === context.auth.uid;
    
    if (!isUser1 && !isUser2) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }
    
    const perspective = isUser1 ? 'user1' : 'user2';
    const now = admin.firestore.Timestamp.now();
    
    // Check if already checked in today
    const myData = friendship[`${perspective}Perspective`];
    const lastInteraction = myData.lastInteraction?.toDate?.() || new Date(0);
    const hoursSince = (now.toDate() - lastInteraction) / (1000 * 60 * 60);
    
    if (hoursSince < 20) {
      throw new functions.https.HttpsError('failed-precondition', 'Already checked in today');
    }
    
    // Calculate debt before check-in (for history)
    const debtBefore = calculateDebt(myData, now);
    
    // Perform check-in
    const updates = {
      [`${perspective}Perspective.lastInteraction`]: now,
      [`${perspective}Perspective.baseDebt`]: 0, // Reset base debt on check-in
      [`${perspective}Perspective.calculatedDebt`]: 0,
      streak: (friendship.streak || 0) + 1
    };
    
    await friendshipRef.update(updates);
    
    // Create check-in record
    await db.collection('checkins').add({
      friendshipId,
      userId: context.auth.uid,
      timestamp: now,
      proof: proof || null,
      debtBefore: debtBefore.totalDebt
    });
    
    // Award aura
    await awardAura(context.auth.uid, 'CHECKIN', { friendshipId });
    
    return {
      success: true,
      debtCleared: debtBefore.totalDebt,
      streak: updates.streak
    };
    
  } catch (error) {
    console.error('Error in check-in:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================

/**
 * On friendship created - initialize calculated fields
 */
exports.onFriendshipCreated = functions.firestore
  .document('friendships/{friendshipId}')
  .onCreate(async (snap, context) => {
    const friendship = snap.data();
    const now = admin.firestore.Timestamp.now();
    
    // Initialize calculated fields for both perspectives
    await snap.ref.update({
      'user1Perspective.calculatedDebt': 0,
      'user1Perspective.calculatedAt': now,
      'user2Perspective.calculatedDebt': 0,
      'user2Perspective.calculatedAt': now
    });
    
    console.log(`Initialized friendship ${context.params.friendshipId}`);
  });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate debt (server-side version)
 */
function calculateDebt(perspectiveData, now) {
  const baseDebt = perspectiveData.baseDebt || 0;
  const limit = perspectiveData.limit || 7;
  const bankruptcyLimit = limit * 2;
  
  let lastInteraction;
  if (perspectiveData.lastInteraction?.toDate) {
    lastInteraction = perspectiveData.lastInteraction.toDate();
  } else {
    lastInteraction = new Date(perspectiveData.lastInteraction || 0);
  }
  
  const nowDate = now.toDate ? now.toDate() : new Date(now);
  const diffTime = Math.abs(nowDate - lastInteraction);
  const daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Interest only accrues after limit (grace period)
  const daysOverLimit = Math.max(0, daysMissed - limit);
  const totalDebt = baseDebt + daysOverLimit;
  
  // Bankruptcy at 2x limit
  const isBankrupt = totalDebt >= bankruptcyLimit;
  const isInWarningZone = totalDebt >= limit && totalDebt < bankruptcyLimit;
  const daysUntilBankrupt = Math.max(0, bankruptcyLimit - totalDebt);
  
  return {
    totalDebt,
    daysMissed,
    daysOverLimit,
    baseDebt,
    limit,
    isBankrupt,
    isInWarningZone,
    daysUntilBankrupt
  };
}

/**
 * Award aura to user
 */
async function awardAura(userId, type, data) {
  const auraAmounts = {
    'CHECKIN': 5,
    'STREAK_BONUS': 10,
    'BOUNTY_CLAIMED': 20,
    'ACHIEVEMENT': 50
  };
  
  const amount = auraAmounts[type] || 5;
  
  const userAuraRef = db.collection('auraBalances').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const auraDoc = await transaction.get(userAuraRef);
    
    if (!auraDoc.exists) {
      transaction.set(userAuraRef, {
        balance: amount,
        totalEarned: amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const current = auraDoc.data();
      transaction.update(userAuraRef, {
        balance: (current.balance || 0) + amount,
        totalEarned: (current.totalEarned || 0) + amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
  
  // Record transaction
  await db.collection('auraTransactions').add({
    userId,
    type: 'EARN',
    amount,
    source: type,
    data,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}
