import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserDoc } from './auth.service';
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
/** Get all applications received by a given club, newest first */
export async function getClubApplications(clubId: string): Promise<Application[]> {
  const q = query(
    collection(db, COLLECTION),
    where('clubId', '==', clubId)
  );
  const snap = await getDocs(q);
  const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
  return apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
export async function createApplication(data: CreateApplicationInput): Promise<string> {    // Prevent clubs from applying
    const currentUser = await getUserDoc(data.userId);
    if (currentUser?.role === 'club') {
      throw new Error('Els clubs no poden aplicar a oportunitats.');
    }
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

/** Update the status of an application (only the owning club should call this) */
export async function updateApplicationStatus(
  id: string,
  status: Application['status'],
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    _updatedAt: serverTimestamp(),
  });
}

/** Delete an application (e.g. if the opportunity was removed) */
export async function deleteApplication(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
