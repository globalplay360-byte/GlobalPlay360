import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, UserRole, PlanType } from '@/types';

const googleProvider = new GoogleAuthProvider();

// ── Helpers ──────────────────────────────────────────────

function trialEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

/** Read the Firestore user document and return our app User */
export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as User;
}

/** Create the Firestore user document (called once on register) */
async function createUserDoc(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
  plan: PlanType = 'trial',
): Promise<User> {
  const userData: Omit<User, 'uid'> = {
    email,
    displayName,
    role,
    plan,
    subscriptionStatus: 'trialing',
    trialEndsAt: trialEndDate(),
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), {
    ...userData,
    _createdAt: serverTimestamp(), // Firestore server timestamp for ordering
  });

  return { uid, ...userData };
}

// ── Auth methods ─────────────────────────────────────────

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getUserDoc(cred.user.uid);
  if (!userDoc) throw new Error('User document not found in Firestore');
  return userDoc;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'player',
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Set displayName on Firebase Auth profile
  await updateProfile(cred.user, { displayName });

  // Create Firestore user document with trial
  return createUserDoc(cred.user.uid, email, displayName, role);
}

export async function loginWithGoogle(
  role: UserRole = 'player',
): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  const { uid, email, displayName, photoURL } = cred.user;

  // If user doc already exists, return it (returning user)
  const existing = await getUserDoc(uid);
  if (existing) return existing;

  // First-time Google login → create user doc
  const user = await createUserDoc(
    uid,
    email ?? '',
    displayName ?? 'User',
    role,
  );

  if (photoURL) {
    await setDoc(doc(db, 'users', uid), { photoURL }, { merge: true });
    user.photoURL = photoURL;
  }

  return user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
