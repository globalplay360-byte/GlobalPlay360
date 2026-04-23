import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
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

  // Send verification email automatically
  const url = `${window.location.origin}/auth/action`;
  await sendEmailVerification(cred.user, { url });

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

// ── Custom Auth flows ────────────────────────────────────

/** Reset password via email link */
export async function resetPassword(email: string): Promise<void> {
  const url = `${window.location.origin}/auth/action`;
  await sendPasswordResetEmail(auth, email, { url });
}

/** Confirm the new password with the code received via email */
export async function confirmNewPassword(code: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(auth, code, newPassword);
}

/** Send verification email to currently logged in user */
export async function verifyEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Cap usuari autenticat en aquesta sessió.');
  const url = `${window.location.origin}/auth/action`;
  await sendEmailVerification(user, { url });
}

export async function confirmEmailVerification(code: string): Promise<void> {
  await applyActionCode(auth, code);
}

/** Check if another user has an active premium plan or valid trial */
export function hasActiveSubscription(user: User | null): boolean {
  if (!user) return false;
  if (user.plan === 'premium' || user.plan === 'pro') return true;
  if (user.subscriptionStatus === 'active') return true;
  
  // If they are in a trial, ensure it hasn't expired
  if (user.plan === 'trial' || user.subscriptionStatus === 'trialing') {
    if (user.trialEndsAt) {
      const trialEnds = new Date(user.trialEndsAt).getTime();
      return trialEnds > Date.now();
    }
  }
  return false;
}
