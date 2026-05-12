import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { AuthSession } from '@/types';
import { auth, db, functions } from './firebase';

const DEVICE_STORAGE_KEY = 'gp360_device_id';

export function getLocalDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) return existing;

  const generated = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(DEVICE_STORAGE_KEY, generated);
  return generated;
}

function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeDate = (value as { toDate?: () => Date }).toDate?.();
    return maybeDate ? maybeDate.toISOString() : null;
  }
  return null;
}

export async function activateSingleSession(): Promise<number> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Cap usuari autenticat per activar la sessió.');
  }

  const callable = httpsCallable<
    { deviceId: string },
    { validAfterSeconds: number }
  >(functions, 'activateSingleSession');

  const { data } = await callable({ deviceId: getLocalDeviceId() });
  return data.validAfterSeconds;
}

export async function getCurrentAuthTimeSeconds(): Promise<number> {
  const currentUser = auth.currentUser;
  if (!currentUser) return 0;

  const tokenResult = await currentUser.getIdTokenResult();
  const authTimeMs = tokenResult.authTime ? new Date(tokenResult.authTime).getTime() : Number.NaN;
  if (Number.isNaN(authTimeMs)) return 0;

  return Math.floor(authTimeMs / 1000);
}

export function subscribeToAuthSession(
  uid: string,
  callback: (session: AuthSession | null) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    doc(db, 'auth_sessions', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      callback({
        validAfterSeconds: typeof data.validAfterSeconds === 'number' ? data.validAfterSeconds : 0,
        lastLoginAt: toIsoDate(data.lastLoginAt),
        lastLoginDeviceId: typeof data.lastLoginDeviceId === 'string' ? data.lastLoginDeviceId : null,
      });
    },
    (err) => onError?.(err as Error),
  );
}

export function isSessionRevokedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes('SESSION_REVOKED') || error.message.includes('permission-denied');
}