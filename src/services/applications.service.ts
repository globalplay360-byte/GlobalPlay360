import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Application } from '@/types';

const COLLECTION = 'applications';

// ── Read ────────────────────────────────────────────────

/** Get all applications for a given user, newest first */
export async function getUserApplications(userId: string): Promise<Application[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
}

/** Check if a user has already applied to a specific opportunity */
export async function hasUserApplied(userId: string, opportunityId: string): Promise<boolean> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('opportunityId', '==', opportunityId),
    limit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Write ───────────────────────────────────────────────

interface CreateApplicationInput {
  opportunityId: string;
  userId: string;
  clubId: string;
  message?: string;
}

/** Create a new application. Returns the document ID. Throws if duplicate. */
export async function createApplication(data: CreateApplicationInput): Promise<string> {
  // Double-check for duplicates before writing
  const alreadyApplied = await hasUserApplied(data.userId, data.opportunityId);
  if (alreadyApplied) {
    throw new Error('Ja has aplicat a aquesta oportunitat.');
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    opportunityId: data.opportunityId,
    userId: data.userId,
    clubId: data.clubId,
    status: 'submitted',
    message: data.message || '',
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });

  return docRef.id;
}
