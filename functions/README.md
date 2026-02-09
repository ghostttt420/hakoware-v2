# Hakoware Firebase Functions

Server-side logic for debt calculations, scheduled jobs, and secure operations.

## What's Moved to the Server?

| Before (Client-side) | After (Server-side) | Why |
|---------------------|---------------------|-----|
| Debt calculation on every render | Daily scheduled calculation + stored in Firestore | Performance, single source of truth |
| Check-in logic in browser | Secure callable function | Prevent manipulation |
| Bankruptcy detection locally | Server detects + records | Reliable, auditable |
| Aura awards calculated client-side | Server awards on check-in | Can't be cheated |

## Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Install Dependencies

```bash
cd functions
npm install
```

### 4. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:dailyDebtAccrual
```

## Available Functions

### Scheduled Functions

#### `dailyDebtAccrual`
- **Schedule**: Every day at midnight (America/New_York)
- **What it does**:
  - Calculates debt for all friendships
  - Detects new bankruptcies
  - Records bankruptcy history
  - Sends notifications
  - Stores calculated values in Firestore

### Callable Functions (HTTP)

#### `calculateFriendshipDebt(friendshipId)`
- **Authentication**: Required
- **Returns**: Current debt stats for user's perspective
- **Side effects**: Updates stored calculation in Firestore

#### `performCheckin(friendshipId, proof?)`
- **Authentication**: Required
- **What it does**:
  - Verifies user hasn't checked in today
  - Resets debt to 0
  - Increments streak
  - Awards aura
  - Creates check-in record

### Firestore Triggers

#### `onFriendshipCreated`
- **Trigger**: When new friendship document is created
- **What it does**: Initializes calculated fields

## Firestore Schema Changes

### New Fields on Friendship Document

```javascript
friendship: {
  user1Perspective: {
    // ... existing fields ...
    
    // NEW: Pre-calculated debt (updated by function)
    calculatedDebt: 5,
    calculatedAt: Timestamp,
    daysMissed: 3,
    isBankrupt: false,
    isInWarningZone: true,
    daysUntilBankrupt: 9
  }
}
```

### New Collection: bankruptcyHistory

```javascript
{
  userId: "user123",
  friendId: "user456",
  friendshipId: "friendship789",
  debtAtBankruptcy: 14,
  declaredAt: Timestamp,
  resolvedAt: null,  // Set when debt cleared
  restoredAt: null   // Set when can use features again
}
```

## Client Integration

### Reading Debt (Fast - No Calculation)

```javascript
import { getStoredDebt } from '../services/functionsService';

// In component
const debt = getStoredDebt(friendship, userId);
// Returns: { totalDebt, daysMissed, isBankrupt, etc. }
```

### Forcing Fresh Calculation

```javascript
import { calculateDebtServer } from '../services/functionsService';

// Call when needed
const freshDebt = await calculateDebtServer(friendshipId);
```

### Performing Check-in

```javascript
import { performCheckin } from '../services/checkinService';

// Automatically uses server function if available
const result = await performCheckin(friendshipId, userId, proof);
```

## Development

### Local Testing

```bash
# Start local functions emulator
firebase emulators:start --only functions

# Test callable function locally
# Function will be available at: http://localhost:5001/YOUR_PROJECT/us-central1/FUNCTION_NAME
```

### Logs

```bash
# View function logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --tail
```

## Security

### Firestore Rules (Update These)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own friendships
    match /friendships/{friendshipId} {
      allow read: if request.auth != null && 
        (resource.data.user1Id == request.auth.uid ||
         resource.data.user2Id == request.auth.uid);
      
      // Only functions can write calculated fields
      allow update: if request.auth != null && 
        (resource.data.user1Id == request.auth.uid ||
         resource.data.user2Id == request.auth.uid) &&
        // Prevent client from updating calculated fields
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['calculatedDebt', 'calculatedAt']);
    }
    
    // Bankruptcy history is read-only for users
    match /bankruptcyHistory/{recordId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         resource.data.friendId == request.auth.uid);
      allow write: if false; // Only functions can write
    }
  }
}
```

## Monitoring

### View Metrics

In Firebase Console:
1. Go to Functions tab
2. View invocations, errors, execution time
3. Set up alerts for failed executions

### Common Issues

| Issue | Solution |
|-------|----------|
| "Function not found" | Deploy functions: `firebase deploy --only functions` |
| Cold start latency | Use min instances (paid plan) or cache client-side |
| Timeout errors | Increase memory allocation or optimize query |
| CORS errors | Ensure proper origin configuration |

## Cost Optimization

### Free Tier Limits
- 2M invocations/month (functions)
- 400k GB-seconds/month (compute)
- Daily scheduled functions count toward quota

### Tips
1. **Cache calculated values** - Client reads stored values, only calls function when needed
2. **Batch writes** - Daily function uses batch operations
3. **Lazy calculation** - Only calculate friendships active in last 30 days

## Migration Guide

### From Client-Only to Server-Assisted

1. **Deploy functions** (above)
2. **Update client** to use `getStoredDebt()`
3. **Backfill data** - Run one-time script to calculate existing friendships
4. **Enable server check-in** by setting `USE_SERVER_CHECKIN = true`
5. **Monitor** for errors or inconsistencies

### Rollback Plan

If issues arise:
1. Set `USE_SERVER_CHECKIN = false` in client
2. Revert to local `calculateDebt` from gameLogic.js
3. Functions remain deployed but unused

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Firebase Funcs  │────▶│   Firestore     │
│                 │     │                  │     │                 │
│ getStoredDebt() │◀────│ calculateDebt()  │◀────│ friendships     │
│ (reads cached)  │     │ (daily schedule) │     │  ├─ calculated  │
│                 │     │                  │     │  ├─ isBankrupt  │
│ performCheckin()│────▶│ performCheckin() │────▶│  └─ daysMissed  │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```
