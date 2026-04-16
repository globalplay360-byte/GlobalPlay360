import type { User } from '@/types';

// Stub: replace with real Firebase Auth calls when connected
// See firebase.ts for setup instructions

const MOCK_USER: User = {
  uid: 'user-player-1',
  email: 'player@globalplay360.com',
  displayName: 'Leo Messi (Mock)',
  role: 'player',
  plan: 'free',
  onboardingCompleted: true,
  createdAt: '2026-01-01T10:00:00Z',
};

export async function loginWithEmail(
  _email: string,
  _password: string,
): Promise<User> {
  // TODO: Replace with firebase signInWithEmailAndPassword
  await delay(500);
  return MOCK_USER;
}

export async function registerWithEmail(
  _email: string,
  _password: string,
  _displayName: string,
): Promise<User> {
  // TODO: Replace with firebase createUserWithEmailAndPassword
  await delay(500);
  return MOCK_USER;
}

export async function loginWithGoogle(): Promise<User> {
  // TODO: Replace with firebase signInWithPopup + GoogleAuthProvider
  await delay(500);
  return MOCK_USER;
}

export async function logout(): Promise<void> {
  // TODO: Replace with firebase signOut
  await delay(300);
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Replace with firebase onAuthStateChanged
  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
