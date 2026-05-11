import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { mapDocs } from '@/utils/firestoreHelpers';
import type { User, Opportunity, Application, UserRole } from '@/types';

export interface AdminMetrics {
  users: {
    total: number;
    byRole: Record<User['role'], number>;
    premium: number;
    newThisWeek: number;
  };
  opportunities: {
    total: number;
    open: number;
    closed: number;
  };
  applications: {
    total: number;
    submitted: number;
    accepted: number;
    rejected: number;
  };
}

const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

function isPremiumUser(u: User): boolean {
  if (u.plan === 'premium' || u.plan === 'pro') return true;
  if (u.subscriptionStatus === 'active') return true;
  if (u.plan === 'trial' && u.trialEndsAt) {
    return new Date(u.trialEndsAt).getTime() > Date.now();
  }
  return false;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [usersSnap, oppsSnap, appsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'opportunities')),
    getDocs(collection(db, 'applications')),
  ]);

  const users = mapDocs<User>(usersSnap);
  const opps = mapDocs<Opportunity>(oppsSnap);
  const apps = mapDocs<Application>(appsSnap);

  const now = Date.now();
  const byRole: Record<User['role'], number> = { player: 0, coach: 0, club: 0, admin: 0 };
  let premium = 0;
  let newThisWeek = 0;

  for (const u of users) {
    if (u.role && byRole[u.role] !== undefined) byRole[u.role] += 1;
    if (isPremiumUser(u)) premium += 1;
    if (u.createdAt && now - new Date(u.createdAt).getTime() <= MS_IN_WEEK) newThisWeek += 1;
  }

  return {
    users: { total: users.length, byRole, premium, newThisWeek },
    opportunities: {
      total: opps.length,
      open: opps.filter((o) => o.status === 'open').length,
      closed: opps.filter((o) => o.status === 'closed').length,
    },
    applications: {
      total: apps.length,
      submitted: apps.filter((a) => a.status === 'submitted').length,
      accepted: apps.filter((a) => a.status === 'accepted').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
    },
  };
}

/**
 * Llista d'usuaris ordenada per data de registre. MVP: client-side pagination.
 * Quan superem ~500 usuaris caldrà migrar a `startAfter` cursors o índex Algolia.
 *
 * Nota: el doc Firestore no guarda `uid` com a camp (l'ID és el del doc), per
 * això injectem `uid: d.id` aquí per consistència amb el tipus User.
 */
export async function listAllUsers(max = 500): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), fbLimit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as User));
}

export interface OpportunityWithStats extends Opportunity {
  applicationsCount: number;
}

/**
 * Llista d'oportunitats enriquides amb el comptador de candidatures rebudes.
 * Una sola query d'applications + agregació in-memory per evitar N+1.
 */
export async function listAllOpportunitiesWithStats(): Promise<OpportunityWithStats[]> {
  const [oppsSnap, appsSnap] = await Promise.all([
    getDocs(query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'))),
    getDocs(collection(db, 'applications')),
  ]);

  const opps = mapDocs<Opportunity>(oppsSnap);
  const apps = mapDocs<Application>(appsSnap);

  const countByOppId = new Map<string, number>();
  for (const a of apps) {
    countByOppId.set(a.opportunityId, (countByOppId.get(a.opportunityId) ?? 0) + 1);
  }

  return opps.map((o) => ({ ...o, applicationsCount: countByOppId.get(o.id) ?? 0 }));
}

export async function adminUpdateUserRole(targetUserId: string, nextRole: UserRole, actorUserId: string): Promise<void> {
  const userRef = doc(db, 'users', targetUserId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error('L\'usuari no existeix.');
  }

  const currentUser = { uid: snap.id, ...snap.data() } as User;
  if (currentUser.role === nextRole) {
    return;
  }

  const batch = writeBatch(db);
  const auditRef = doc(collection(db, 'admin_audit_logs'));

  batch.update(userRef, { role: nextRole });
  batch.set(auditRef, {
    actorUserId,
    action: 'user.role_changed',
    targetType: 'user',
    targetId: targetUserId,
    metadata: {
      previousRole: currentUser.role,
      nextRole,
      displayName: currentUser.displayName,
    },
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function adminUpdateOpportunity(
  id: string,
  data: Partial<Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>>,
  actorUserId: string,
): Promise<void> {
  const opportunityRef = doc(db, 'opportunities', id);
  const snap = await getDoc(opportunityRef);

  if (!snap.exists()) {
    throw new Error('L\'oportunitat no existeix.');
  }

  const previous = { id: snap.id, ...snap.data() } as Opportunity;
  const changedFields = Object.keys(data).filter((field) => {
    const key = field as keyof typeof data;
    return JSON.stringify(previous[key as keyof Opportunity]) !== JSON.stringify(data[key]);
  });

  const batch = writeBatch(db);
  const auditRef = doc(collection(db, 'admin_audit_logs'));

  batch.update(opportunityRef, {
    ...data,
    _updatedAt: serverTimestamp(),
  });
  batch.set(auditRef, {
    actorUserId,
    action: 'opportunity.updated',
    targetType: 'opportunity',
    targetId: id,
    metadata: {
      title: previous.title,
      clubId: previous.clubId,
      changedFields,
    },
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function adminDeleteOpportunity(id: string, actorUserId: string): Promise<void> {
  const opportunityRef = doc(db, 'opportunities', id);
  const snap = await getDoc(opportunityRef);

  if (!snap.exists()) {
    throw new Error('L\'oportunitat no existeix.');
  }

  const previous = { id: snap.id, ...snap.data() } as Opportunity;
  const batch = writeBatch(db);
  const auditRef = doc(collection(db, 'admin_audit_logs'));

  batch.delete(opportunityRef);
  batch.set(auditRef, {
    actorUserId,
    action: 'opportunity.deleted',
    targetType: 'opportunity',
    targetId: id,
    metadata: {
      title: previous.title,
      clubId: previous.clubId,
      sport: previous.sport,
      status: previous.status,
    },
    createdAt: new Date().toISOString(),
    _createdAt: serverTimestamp(),
  });

  await batch.commit();
}
