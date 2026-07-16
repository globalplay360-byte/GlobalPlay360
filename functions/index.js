import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
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

// Versió dels textos legals vigents (data de l'última revisió de
// privacy/terms/cookies a src/content/legal). Actualitzar quan canviïn.
const LEGAL_TEXTS_VERSION = '2026-07-16';

const CONSENT_TYPES = ['registration'];

function getRequestIp(rawRequest) {
  const forwarded = rawRequest?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return typeof rawRequest?.ip === 'string' ? rawRequest.ip.slice(0, 64) : '';
}

function getRequestHeader(rawRequest, name, maxLength) {
  const value = rawRequest?.headers?.[name];
  return typeof value === 'string' ? value.slice(0, maxLength) : '';
}

// Reauth recent per a operacions destructives: el token ha d'haver estat
// emès amb un login de fa menys de 5 minuts.
const RECENT_AUTH_MAX_AGE_SECONDS = 5 * 60;

function assertRecentAuth(request) {
  const authTime = Number(request.auth?.token?.auth_time ?? 0);
  const ageSeconds = Date.now() / 1000 - authTime;
  if (!Number.isFinite(authTime) || authTime <= 0 || ageSeconds > RECENT_AUTH_MAX_AGE_SECONDS) {
    throw new HttpsError('failed-precondition', 'RECENT_LOGIN_REQUIRED');
  }
}

async function hasBlockingSubscription(uid) {
  const snap = await db
    .collection('customers')
    .doc(uid)
    .collection('subscriptions')
    .where('status', 'in', BLOCKING_SUBSCRIPTION_STATUSES)
    .limit(1)
    .get();
  return !snap.empty;
}

/** Esborra paginadament tots els docs que retorna una query. Retorna el recompte. */
async function deleteQueryDocs(buildQuery) {
  let deletedCount = 0;
  while (true) {
    const snap = await buildQuery().limit(200).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    deletedCount += snap.size;
  }
  return deletedCount;
}

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

/**
 * Registre de consentiment (Art. 7 RGPD): log immutable server-side amb
 * timestamp, versió dels textos legals, IP i user agent. El client només
 * declara el tipus de consentiment; la resta s'extreu de la petició al
 * servidor. Les rules de `consent_history` són write-only-Admin.
 */
export const recordConsent = onCall({
  cors: true,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;
  const consentType = CONSENT_TYPES.includes(request.data?.consentType)
    ? request.data.consentType
    : 'registration';

  await db.collection('consent_history').doc(uid).collection('entries').add({
    consentType,
    legalTextsVersion: LEGAL_TEXTS_VERSION,
    acceptedTerms: true,
    acceptedPrivacy: true,
    ip: getRequestIp(request.rawRequest),
    userAgent: getRequestHeader(request.rawRequest, 'user-agent', 256),
    locale: getRequestHeader(request.rawRequest, 'accept-language', 32),
    acceptedAt: FieldValue.serverTimestamp(),
  });

  return { recorded: true, legalTextsVersion: LEGAL_TEXTS_VERSION };
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

/**
 * Esborrat total del compte (Art. 17 RGPD — dret a l'oblit).
 *
 * Precondicions: reauth recent (<5 min) i cap subscripció viva (l'usuari ha
 * de cancel·lar primer via Customer Portal; evita seguir cobrant un compte
 * esborrat). Esborra: Firestore (users + private, applications, opportunities
 * pròpies, conversations + missatges, customers/*, billing_state,
 * auth_sessions, consent_history, export_logs), Storage (users/{uid}/*) i el
 * compte d'Auth. Deixa un log immutable amb el HASH del uid (mai en clar).
 *
 * NOTA Stripe: el customer de Stripe NO s'esborra des d'aquí (les factures
 * s'han de conservar 6 anys per obligació fiscal, tal com declara la
 * política de privacitat §7). El vincle uid→customer desapareix de Firestore.
 *
 * NOTA consentiment: `consent_history` NO s'esborra (Art. 17.3.e — conservació
 * per a la formulació/exercici/defensa de reclamacions). És l'única prova que
 * l'usuari va acceptar termes i privacitat; destruir-la ens deixaria sense
 * defensa davant una reclamació. Queda com a registre pseudonimitzat (només
 * uid + metadades del consentiment, sense la resta de dades personals).
 */
export const deleteUserAccount = onCall({
  cors: true,
  timeoutSeconds: 300,
  memory: '512MiB',
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }
  assertRecentAuth(request);

  const uid = request.auth.uid;

  if (await hasBlockingSubscription(uid)) {
    throw new HttpsError('failed-precondition', 'SUBSCRIPTION_ACTIVE');
  }

  const counts = {};

  // 1. Candidatures: com a candidat i com a club receptor.
  counts.applicationsAsUser = await deleteQueryDocs(
    () => db.collection('applications').where('userId', '==', uid),
  );
  counts.applicationsAsClub = await deleteQueryDocs(
    () => db.collection('applications').where('clubId', '==', uid),
  );

  // 2. Oportunitats pròpies (rol club).
  counts.opportunities = await deleteQueryDocs(
    () => db.collection('opportunities').where('clubId', '==', uid),
  );

  // 3. Converses on participa (amb tots els missatges).
  let conversationCount = 0;
  while (true) {
    const convSnap = await db
      .collection('conversations')
      .where('participants', 'array-contains', uid)
      .limit(CLEANUP_BATCH_LIMIT)
      .get();
    if (convSnap.empty) break;
    for (const convDoc of convSnap.docs) {
      await deleteConversationWithMessages(convDoc.id);
      conversationCount += 1;
    }
  }
  counts.conversations = conversationCount;

  // 4. Docs amb subcol·leccions: recursiveDelete els neteja sencers.
  //    `consent_history` es CONSERVA a propòsit (Art. 17.3.e, vegeu capçalera).
  await db.recursiveDelete(db.doc(`customers/${uid}`));
  await db.recursiveDelete(db.doc(`users/${uid}`));

  // 5. Docs simples.
  await db.doc(`billing_state/${uid}`).delete();
  await db.doc(`auth_sessions/${uid}`).delete();
  await db.doc(`export_logs/${uid}`).delete();

  // 6. Storage: avatar i qualsevol fitxer del directori de l'usuari.
  await getStorage().bucket().deleteFiles({ prefix: `users/${uid}/` });

  // 7. Log immutable amb hash del uid (verificable sense exposar-lo).
  await db.collection('deletion_logs').add({
    uidHash: createHash('sha256').update(uid).digest('hex'),
    deletedAt: FieldValue.serverTimestamp(),
    counts,
    consentHistoryConserved: true,
  });

  // 8. Compte d'Auth: l'últim, perquè si res anterior falla l'usuari pugui reintentar.
  await auth.deleteUser(uid);

  return { deleted: true };
});

/**
 * Exportació de dades (Art. 20 RGPD — portabilitat).
 *
 * Retorna un JSON estructurat amb totes les dades personals de l'usuari:
 * perfil públic i privat, candidatures, oportunitats pròpies, converses amb
 * els SEUS missatges (els dels altres participants són dades de tercers),
 * resum de subscripcions i historial de consentiments. Rate limit: 1 export
 * cada 24 h (minimització de càrrega i d'abús).
 */
export const exportUserData = onCall({
  cors: true,
  timeoutSeconds: 300,
  memory: '512MiB',
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = request.auth.uid;

  const exportLogRef = db.doc(`export_logs/${uid}`);
  const exportLogSnap = await exportLogRef.get();
  const lastExportMillis = getTimestampMillis(exportLogSnap.data()?.lastExportAt);
  if (typeof lastExportMillis === 'number' && Date.now() - lastExportMillis < 24 * 60 * 60 * 1000) {
    throw new HttpsError('resource-exhausted', 'EXPORT_RATE_LIMITED');
  }

  const [userSnap, privateSnap, applicationsSnap, opportunitiesSnap, conversationsSnap, subscriptionsSnap, consentSnap] =
    await Promise.all([
      db.doc(`users/${uid}`).get(),
      db.doc(`users/${uid}/private/profile`).get(),
      db.collection('applications').where('userId', '==', uid).get(),
      db.collection('opportunities').where('clubId', '==', uid).get(),
      db.collection('conversations').where('participants', 'array-contains', uid).get(),
      db.collection('customers').doc(uid).collection('subscriptions').get(),
      db.collection('consent_history').doc(uid).collection('entries').get(),
    ]);

  const conversations = [];
  for (const convDoc of conversationsSnap.docs) {
    const ownMessagesSnap = await convDoc.ref
      .collection('messages')
      .where('senderId', '==', uid)
      .get();
    conversations.push({
      id: convDoc.id,
      participants: convDoc.data()?.participants ?? [],
      myMessages: ownMessagesSnap.docs.map((msgDoc) => ({ id: msgDoc.id, ...msgDoc.data() })),
    });
  }

  await exportLogRef.set({
    lastExportAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return {
    exportedAt: new Date().toISOString(),
    format: 'GlobalPlay360 personal data export (Art. 20 GDPR)',
    profile: userSnap.exists ? userSnap.data() : null,
    privateProfile: privateSnap.exists ? privateSnap.data() : null,
    applications: applicationsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    opportunities: opportunitiesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    conversations,
    subscriptions: subscriptionsSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        status: data?.status ?? null,
        cancelAtPeriodEnd: data?.cancel_at_period_end ?? null,
        created: toIsoStringFromTimestamp(data?.created),
        currentPeriodEnd: toIsoStringFromTimestamp(data?.current_period_end),
        trialEnd: toIsoStringFromTimestamp(data?.trial_end),
      };
    }),
    consentHistory: consentSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    // URL de descàrrega amb token de l'avatar (Art. 20: dada personal exportable).
    // `photoURL` ja és la download URL signada que genera Storage a la pujada.
    avatarUrl: userSnap.exists ? (userSnap.data()?.photoURL ?? null) : null,
    avatarStoragePath: `users/${uid}/avatar.jpg`,
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