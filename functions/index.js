import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  BLOCKING_SUBSCRIPTION_STATUSES,
  FOUNDING_MEMBERS_ACCESS_END_ISO,
  FOUNDING_MEMBERS_CAMPAIGN_ID,
  FOUNDING_MEMBERS_LIMIT,
  canClaimFounderAccess,
  getExpectedSegmentForRole,
  getFoundingMembersAccessEndDate,
  getProductSegment,
  isTrialPrice,
  selectCheckoutPrice,
} from './billingPolicy.js';
import { MESSAGE_RETENTION_DAYS, getRetentionCutoffDate } from './retention.js';

initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const auth = getAuth();
const db = getFirestore();
const CLEANUP_BATCH_LIMIT = 25;
const FOUNDING_MEMBERS_ACCESS_END_DATE = getFoundingMembersAccessEndDate();

function getBillingStateRef(uid) {
  return db.doc(`billing_state/${uid}`);
}

function getUserRef(uid) {
  return db.doc(`users/${uid}`);
}

function getFoundingMembersCampaignRef() {
  return db.doc(`campaigns/${FOUNDING_MEMBERS_CAMPAIGN_ID}`);
}

function normalizeOptionalUrl(value, fallback) {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : fallback;
}

function getTimestampMillis(value) {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'object' && value !== null && typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }
  return null;
}

function toIsoStringFromTimestamp(value) {
  const millis = getTimestampMillis(value);
  return typeof millis === 'number' ? new Date(millis).toISOString() : '';
}

async function getActiveProductPrices(productId) {
  const pricesSnap = await db
    .collection('products')
    .doc(productId)
    .collection('prices')
    .where('active', '==', true)
    .get();

  return pricesSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

async function deleteConversationWithMessages(conversationId) {
  const conversationRef = db.doc(`conversations/${conversationId}`);
  const messagesRef = conversationRef.collection('messages');

  while (true) {
    const messageSnap = await messagesRef.limit(400).get();
    if (messageSnap.empty) break;

    const batch = db.batch();
    messageSnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }

  await conversationRef.delete();
}

export const activateSingleSession = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;
  const authTime = Number(request.auth.token.auth_time ?? 0);
  if (!Number.isFinite(authTime) || authTime <= 0) {
    throw new HttpsError('failed-precondition', 'Missing auth_time in token.');
  }

  const rawDeviceId = request.data?.deviceId;
  const deviceId = typeof rawDeviceId === 'string' && rawDeviceId.trim() !== ''
    ? rawDeviceId.trim().slice(0, 128)
    : null;

  const sessionRef = db.doc(`auth_sessions/${uid}`);
  const sessionSnap = await sessionRef.get();
  const currentValidAfter = sessionSnap.exists ? sessionSnap.data()?.validAfterSeconds : null;

  if (typeof currentValidAfter === 'number' && authTime < currentValidAfter) {
    throw new HttpsError('permission-denied', 'SESSION_REVOKED');
  }

  await sessionRef.set(
    {
      validAfterSeconds: authTime,
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      ...(deviceId ? { lastLoginDeviceId: deviceId } : {}),
    },
    { merge: true },
  );

  return { validAfterSeconds: authTime };
});

export const createBillingCheckoutSession = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;
  const rawPriceId = request.data?.priceId;
  const priceId = typeof rawPriceId === 'string' && rawPriceId.trim() !== ''
    ? rawPriceId.trim()
    : null;
  const rawProductId = request.data?.productId;
  const productId = typeof rawProductId === 'string' && rawProductId.trim() !== ''
    ? rawProductId.trim()
    : null;

  if (!priceId || !productId) {
    throw new HttpsError('invalid-argument', 'Missing priceId or productId.');
  }

  const successUrl = normalizeOptionalUrl(
    request.data?.successUrl,
    'https://globalplay360.com/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  );
  const cancelUrl = normalizeOptionalUrl(
    request.data?.cancelUrl,
    'https://globalplay360.com/pricing?checkout=cancel',
  );

  // Validació rol↔segment: el rol es llegeix del doc Firestore de l'usuari
  // (server-side), mai del payload del client. Cada Product porta metadata
  // `segment` (individual|club); un rol només pot comprar el seu segment.
  const [userSnap, productSnap] = await Promise.all([
    getUserRef(uid).get(),
    db.doc(`products/${productId}`).get(),
  ]);

  if (!userSnap.exists) {
    throw new HttpsError('failed-precondition', 'USER_PROFILE_NOT_FOUND');
  }
  if (!productSnap.exists) {
    throw new HttpsError('not-found', 'PRODUCT_NOT_FOUND');
  }

  const expectedSegment = getExpectedSegmentForRole(userSnap.data()?.role);
  if (!expectedSegment) {
    throw new HttpsError('permission-denied', 'ROLE_NOT_ELIGIBLE_FOR_CHECKOUT');
  }

  const productSegment = getProductSegment(productSnap.data());
  if (!productSegment) {
    // Products sense metadata `segment` (p. ex. el catàleg antic) no es poden
    // comprar: obliga a fer servir el catàleg segmentat nou.
    throw new HttpsError('failed-precondition', 'PRODUCT_SEGMENT_MISSING');
  }
  if (productSegment !== expectedSegment) {
    throw new HttpsError('permission-denied', 'PRODUCT_NOT_ALLOWED_FOR_ROLE');
  }

  // Guard antidoble subscripció: si l'usuari ja té una subscripció viva
  // (trialing, active o past_due amb reintents pendents), no obrim una segona
  // checkout session. Canvis de pla o d'interval: via Customer Portal.
  const blockingSubscriptionSnap = await db
    .collection('customers')
    .doc(uid)
    .collection('subscriptions')
    .where('status', 'in', BLOCKING_SUBSCRIPTION_STATUSES)
    .limit(1)
    .get();

  if (!blockingSubscriptionSnap.empty) {
    throw new HttpsError('failed-precondition', 'SUBSCRIPTION_ALREADY_ACTIVE');
  }

  const billingStateRef = getBillingStateRef(uid);
  const billingStateSnap = await billingStateRef.get();
  const billingState = billingStateSnap.exists ? billingStateSnap.data() : null;
  const activeProductPrices = await getActiveProductPrices(productId);
  const selectedPrice = selectCheckoutPrice(activeProductPrices, billingState, priceId);

  if (!selectedPrice) {
    throw new HttpsError('failed-precondition', 'No eligible price is active for this product.');
  }

  const trialGranted = isTrialPrice(selectedPrice);

  const sessionRef = await db.collection('customers').doc(uid).collection('checkout_sessions').add({
    client: 'web',
    price: selectedPrice.id,
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      source: 'globalplay360',
      requestedPriceId: priceId,
      selectedPriceId: selectedPrice.id,
      trialEligible: String(trialGranted),
    },
  });

  const billingStateUpdate = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!billingStateSnap.exists) {
    billingStateUpdate.createdAt = FieldValue.serverTimestamp();
  }

  await billingStateRef.set(billingStateUpdate, { merge: true });

  return {
    sessionId: sessionRef.id,
    trialGranted,
  };
});

export const syncBillingStateFromSubscription = onDocumentWritten({
  document: 'customers/{uid}/subscriptions/{subscriptionId}',
}, async (event) => {
  const afterSnap = event.data?.after;
  if (!afterSnap?.exists) {
    return;
  }

  const subscription = afterSnap.data();
  const trialEndMillis = getTimestampMillis(subscription?.trial_end);
  const currentPeriodEndMillis = getTimestampMillis(subscription?.current_period_end);
  const hasActiveTrialWindow = typeof trialEndMillis === 'number' && trialEndMillis > Date.now();
  const hasPaidAccess =
    subscription?.status === 'active'
    && !subscription?.cancel_at_period_end
    && !hasActiveTrialWindow
    && typeof currentPeriodEndMillis === 'number'
    && currentPeriodEndMillis > Date.now();

  const uid = event.params.uid;
  const billingStateRef = getBillingStateRef(uid);
  const userRef = getUserRef(uid);
  await db.runTransaction(async (transaction) => {
    const [billingStateSnap, userSnap] = await Promise.all([
      transaction.get(billingStateRef),
      transaction.get(userRef),
    ]);

    if (!userSnap.exists) {
      return;
    }

    transaction.set(userRef, {
      plan: hasActiveTrialWindow ? 'trial' : hasPaidAccess ? 'premium' : 'free',
      subscriptionStatus: hasActiveTrialWindow ? 'trialing' : (subscription?.status ?? 'none'),
      trialEndsAt: hasActiveTrialWindow ? toIsoStringFromTimestamp(subscription?.trial_end) : '',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (!hasActiveTrialWindow || billingStateSnap.data()?.trialConsumedAt) {
      return;
    }

    const billingStateUpdate = {
      trialConsumedAt: FieldValue.serverTimestamp(),
      lastTrialSubscriptionId: event.params.subscriptionId,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!billingStateSnap.exists) {
      billingStateUpdate.createdAt = FieldValue.serverTimestamp();
    }

    transaction.set(billingStateRef, billingStateUpdate, { merge: true });
  });
});

export const claimFounderAccess = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;
  const campaignRef = getFoundingMembersCampaignRef();
  const billingStateRef = getBillingStateRef(uid);
  const now = new Date();

  const claimResult = await db.runTransaction(async (transaction) => {
    const campaignSnap = await transaction.get(campaignRef);
    const billingStateSnap = await transaction.get(billingStateRef);

    const campaignData = campaignSnap.exists ? campaignSnap.data() : {};
    const billingState = billingStateSnap.exists ? billingStateSnap.data() : null;
    const claimedCount = typeof campaignData?.claimedCount === 'number' ? campaignData.claimedCount : 0;
    const maxClaims = typeof campaignData?.maxClaims === 'number' ? campaignData.maxClaims : FOUNDING_MEMBERS_LIMIT;
    const remainingClaims = Math.max(maxClaims - claimedCount, 0);

    if (billingState?.founderClaimedAt) {
      return {
        alreadyClaimed: true,
        claimNumber: typeof billingState.founderClaimNumber === 'number' ? billingState.founderClaimNumber : null,
        remainingClaims,
      };
    }

    if (!canClaimFounderAccess({ billingState, claimedCount, maxClaims, now })) {
      throw new HttpsError('failed-precondition', 'FOUNDER_ACCESS_UNAVAILABLE');
    }

    const claimNumber = claimedCount + 1;
    const nextRemainingClaims = Math.max(maxClaims - claimNumber, 0);
    const campaignUpdate = {
      active: true,
      title: 'Founding Members 2026',
      maxClaims,
      claimedCount: claimNumber,
      remainingClaims: nextRemainingClaims,
      accessEndsAt: Timestamp.fromDate(FOUNDING_MEMBERS_ACCESS_END_DATE),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const billingStateUpdate = {
      founderCampaignId: FOUNDING_MEMBERS_CAMPAIGN_ID,
      founderClaimedAt: FieldValue.serverTimestamp(),
      founderClaimNumber: claimNumber,
      founderAccessUntil: Timestamp.fromDate(FOUNDING_MEMBERS_ACCESS_END_DATE),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!campaignSnap.exists) {
      campaignUpdate.createdAt = FieldValue.serverTimestamp();
    }

    if (!billingStateSnap.exists) {
      billingStateUpdate.createdAt = FieldValue.serverTimestamp();
    }

    transaction.set(campaignRef, campaignUpdate, { merge: true });
    transaction.set(billingStateRef, billingStateUpdate, { merge: true });

    return {
      alreadyClaimed: false,
      claimNumber,
      remainingClaims: nextRemainingClaims,
    };
  });

  const userRecord = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, {
    ...(userRecord.customClaims ?? {}),
    founderAccess: true,
    founderAccessUntil: Math.floor(FOUNDING_MEMBERS_ACCESS_END_DATE.getTime() / 1000),
  });

  return {
    ...claimResult,
    accessEndsAt: FOUNDING_MEMBERS_ACCESS_END_ISO,
  };
});

export const cleanupInactiveConversations = onSchedule({
  schedule: 'every day 03:00',
  timeZone: 'Europe/Madrid',
  retryCount: 1,
}, async () => {
  const cutoffDate = getRetentionCutoffDate();
  const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

  let deletedCount = 0;

  while (true) {
    const staleConversations = await db
      .collection('conversations')
      .where('updatedAt', '<', cutoffTimestamp)
      .orderBy('updatedAt', 'asc')
      .limit(CLEANUP_BATCH_LIMIT)
      .get();

    if (staleConversations.empty) break;

    for (const conversationDoc of staleConversations.docs) {
      await deleteConversationWithMessages(conversationDoc.id);
      deletedCount += 1;
    }
  }

  console.log(`cleanupInactiveConversations deleted ${deletedCount} conversations older than ${MESSAGE_RETENTION_DAYS} days.`);
});