import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { MESSAGE_RETENTION_DAYS, getRetentionCutoffDate } from './retention.js';

initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

const db = getFirestore();
const CLEANUP_BATCH_LIMIT = 25;

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