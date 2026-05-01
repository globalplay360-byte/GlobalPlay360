import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';
import { mapDocs } from '@/utils/firestoreHelpers';
import type { Opportunity } from '@/types';

const COLLECTION = 'opportunities';

// ── Read ────────────────────────────────────────────────

/** Fetch all opportunities, ordered by creation date (newest first) */
export async function getOpportunities(): Promise<Opportunity[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return mapDocs<Opportunity>(snap);
}

/** Fetch opportunities filtered by a single field */
export async function getOpportunitiesByField(
  field: string,
  op: WhereFilterOp,
  value: unknown,
): Promise<Opportunity[]> {
  const q = query(
    collection(db, COLLECTION),
    where(field, op, value),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return mapDocs<Opportunity>(snap);
}

/** Fetch a single opportunity by its document ID */
export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Opportunity;
}

// ── Write ───────────────────────────────────────────────

/** Create a new opportunity (only clubs should call this) */
export async function createOpportunity(
  data: Omit<Opportunity, 'id' | 'createdAt'>,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Update an existing opportunity (partial update) */
export async function updateOpportunity(
  id: string,
  data: Partial<Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    _updatedAt: serverTimestamp(),
  });
}

/** Toggle opportunity status between open and closed */
export async function toggleOpportunityStatus(id: string, currentStatus: Opportunity['status']): Promise<void> {
  const newStatus = currentStatus === 'open' ? 'closed' : 'open';
  await updateDoc(doc(db, COLLECTION, id), {
    status: newStatus,
    _updatedAt: serverTimestamp(),
  });
}

/** Delete an opportunity permanently */
export async function deleteOpportunity(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
