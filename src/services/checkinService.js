import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { performCheckinServer } from './functionsService';

// Feature flag: Use server-side check-in (more secure)
const USE_SERVER_CHECKIN = true;

const CHECKINS_COLLECTION = 'checkins';
const FRIENDSHIPS_COLLECTION = 'friendships';

// Check if user has already checked in today
export const hasCheckedInToday = async (friendshipId, userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkinsRef = collection(db, CHECKINS_COLLECTION);
    const q = query(
      checkinsRef,
      where('friendshipId', '==', friendshipId),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking today\'s check-in:', error);
    return false;
  }
};

// Get last check-in date
export const getLastCheckin = async (friendshipId, userId) => {
  try {
    const checkinsRef = collection(db, CHECKINS_COLLECTION);
    const q = query(
      checkinsRef,
      where('friendshipId', '==', friendshipId),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Error getting last check-in:', error);
    return null;
  }
};

// Perform a check-in (server-side for security)
export const performCheckin = async (friendshipId, userId, proofOfContact = null) => {
  try {
    // Try server-side check-in first (more secure)
    if (USE_SERVER_CHECKIN) {
      try {
        const result = await performCheckinServer(friendshipId, proofOfContact);
        return {
          success: true,
          debtCleared: result.debtCleared,
          streak: result.streak,
          message: `Check-in successful! ${result.debtCleared > 0 ? `Cleared ${result.debtCleared} APR debt.` : ''}`,
          fromServer: true
        };
      } catch (serverError) {
        console.warn('Server check-in failed, falling back to local:', serverError.message);
        // Fall through to local check-in
      }
    }

    // Local fallback (less secure, but works without functions deployed)
    return await performCheckinLocal(friendshipId, userId, proofOfContact);
  } catch (error) {
    console.error('Error performing check-in:', error);
    return { success: false, error: error.message };
  }
};

// Local check-in (fallback when server functions unavailable)
const performCheckinLocal = async (friendshipId, userId, proofOfContact = null) => {
  // Check if already checked in today
  const alreadyCheckedIn = await hasCheckedInToday(friendshipId, userId);
  if (alreadyCheckedIn) {
    return { 
      success: false, 
      error: 'ALREADY_CHECKED_IN',
      message: 'You have already checked in today. Come back tomorrow!' 
    };
  }

  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const friendshipDoc = await getDoc(friendshipRef);

  if (!friendshipDoc.exists()) {
    return { success: false, error: 'Friendship not found' };
  }

  const friendship = friendshipDoc.data();
  const isUser1 = friendship.user1?.userId === userId || friendship.user1Id === userId;
  const perspective = isUser1 ? 'user1Perspective' : 'user2Perspective';
  const myData = friendship[perspective];

  if (!myData) {
    return { success: false, error: 'User perspective not found' };
  }

  // Reset debt on check-in
  const newBaseDebt = 0;

  // Calculate streak
  const lastCheckin = await getLastCheckin(friendshipId, userId);
  let newStreak = friendship.streak || 0;
  
  if (lastCheckin) {
    const lastDate = lastCheckin.timestamp.toDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastCheckinDate = new Date(lastDate);
    lastCheckinDate.setHours(0, 0, 0, 0);

    if (lastCheckinDate.getTime() === yesterday.getTime()) {
      newStreak += 1;
    } else if (lastCheckinDate.getTime() < yesterday.getTime()) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const now = serverTimestamp();

  // Create check-in record
  const checkinRef = await addDoc(collection(db, CHECKINS_COLLECTION), {
    friendshipId,
    userId,
    timestamp: now,
    proofOfContact,
    debtBefore: myData.baseDebt || 0,
    debtAfter: newBaseDebt,
    streakAtCheckin: newStreak
  });

  // Update friendship
  const updates = {
    [`${perspective}.baseDebt`]: newBaseDebt,
    [`${perspective}.lastInteraction`]: now,
    [`${perspective}.lastCheckinId`]: checkinRef.id,
    [`${perspective}.calculatedDebt`]: 0,
    streak: newStreak,
    totalCheckins: (friendship.totalCheckins || 0) + 1,
    lastCheckinAt: now
  };

  if (newStreak > (friendship.longestStreak || 0)) {
    updates.longestStreak = newStreak;
  }

  await updateDoc(friendshipRef, updates);

  return {
    success: true,
    checkinId: checkinRef.id,
    debtCleared: myData.baseDebt || 0,
    streak: newStreak,
    message: 'Check-in successful!',
    fromServer: false
  };
};

// Get check-in history for a friendship
export const getCheckinHistory = async (friendshipId, limit_count = 50) => {
  try {
    const checkinsRef = collection(db, CHECKINS_COLLECTION);
    const q = query(
      checkinsRef,
      where('friendshipId', '==', friendshipId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting check-in history:', error);
    return [];
  }
};

// Get check-in stats for a user across all friendships
export const getUserCheckinStats = async (userId) => {
  try {
    const checkinsRef = collection(db, CHECKINS_COLLECTION);
    const q = query(
      checkinsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const checkins = snapshot.docs.map(doc => doc.data());

    const stats = {
      totalCheckins: checkins.length,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    checkins.forEach(checkin => {
      const checkinDate = checkin.timestamp.toDate();
      if (checkinDate >= weekAgo) stats.thisWeek++;
      if (checkinDate >= monthAgo) stats.thisMonth++;
    });

    return stats;
  } catch (error) {
    console.error('Error getting user check-in stats:', error);
    return { totalCheckins: 0, thisWeek: 0, thisMonth: 0 };
  }
};

// Calculate interest for all friendships (should be run daily by cron job)
export const calculateDailyInterest = async () => {
  try {
    const friendshipsRef = collection(db, FRIENDSHIPS_COLLECTION);
    const snapshot = await getDocs(friendshipsRef);

    const results = [];

    for (const docSnap of snapshot.docs) {
      const friendship = docSnap.data();
      const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, docSnap.id);

      // Check both perspectives
      const updates = {};
      let hasUpdate = false;

      // User 1 perspective
      if (friendship.user1Perspective) {
        const lastInteraction = friendship.user1Perspective.lastInteraction?.toDate();
        if (lastInteraction) {
          const daysSince = Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
          const limit = friendship.user1Perspective.limit || 7;
          
          if (daysSince > limit) {
            const daysOverLimit = daysSince - limit;
            const currentDebt = friendship.user1Perspective.baseDebt || 0;
            const newDebt = currentDebt + 1; // +1 per day over limit
            
            updates['user1Perspective.baseDebt'] = newDebt;
            hasUpdate = true;

            results.push({
              friendshipId: docSnap.id,
              userId: friendship.user1.userId,
              userName: friendship.user1.displayName,
              debtIncrease: 1,
              newDebt: newDebt,
              daysGhosted: daysSince
            });
          }
        }
      }

      // User 2 perspective
      if (friendship.user2Perspective) {
        const lastInteraction = friendship.user2Perspective.lastInteraction?.toDate();
        if (lastInteraction) {
          const daysSince = Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
          const limit = friendship.user2Perspective.limit || 7;
          
          if (daysSince > limit) {
            const daysOverLimit = daysSince - limit;
            const currentDebt = friendship.user2Perspective.baseDebt || 0;
            const newDebt = currentDebt + 1;
            
            updates['user2Perspective.baseDebt'] = newDebt;
            hasUpdate = true;

            results.push({
              friendshipId: docSnap.id,
              userId: friendship.user2.userId,
              userName: friendship.user2.displayName,
              debtIncrease: 1,
              newDebt: newDebt,
              daysGhosted: daysSince
            });
          }
        }
      }

      if (hasUpdate) {
        updates.lastInterestCalculated = serverTimestamp();
        await updateDoc(friendshipRef, updates);
      }
    }

    return { success: true, updates: results };
  } catch (error) {
    console.error('Error calculating daily interest:', error);
    return { success: false, error: error.message };
  }
};
