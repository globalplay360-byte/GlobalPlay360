import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import type { User, UserRole, PlanType } from '@/types';
import { getUserPrivateProfile, migrateLegacyPrivateFields } from './profile.service';
import { activateSingleSession } from './session.service';
import { PUBLIC_REGISTRATION_ENABLED } from '@/config/site';

/**
 * Registra el consentiment (Art. 7 RGPD) via CF: el servidor hi afegeix
 * timestamp, versió dels textos legals, IP i user agent, i escriu al log
 * immutable `consent_history`. El checkbox del formulari és el consentiment;
 * això n'és l'evidència. Si la crida falla no bloquegem el registre (l'usuari
 * ja existeix a Auth), però en deixem constància a la consola.
 */
async function recordRegistrationConsent(ageDeclaredOver16: boolean): Promise<void> {
  try {
    const fn = httpsCallable<
      { consentType: string; ageDeclaredOver16: boolean },
      { recorded: boolean }
    >(functions, 'recordConsent');
    await fn({ consentType: 'registration', ageDeclaredOver16 });
  } catch (err) {
    console.error('No s\'ha pogut registrar el consentiment:', err);
  }
}

// ── Helpers ──────────────────────────────────────────────

/**
 * Read the Firestore user document and return our app User.
 * Merge automàtic amb la subcol·lecció privada `users/{uid}/private/profile`
 * si l'usuari actual té accés (owner o Premium). Si és Free llegint un altre
 * perfil, els camps privats no es retornen (protegit per rules).
 *
 * Bonus: si el propietari encara té camps sensibles al doc legacy (abans del
 * schema split), s'inicia una migració lazy en background.
 */
export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const publicData = snap.data() as Record<string, unknown>;
  const privateData = await getUserPrivateProfile(uid);

  // Migració lazy només si l'usuari actual és el propietari del doc
  if (auth.currentUser?.uid === uid) {
    void migrateLegacyPrivateFields(uid, publicData);
  }

  return {
    uid,
    ...publicData,
    ...(privateData ?? {}),
  } as User;
}

/** Create the Firestore user document (called once on register) */
async function createUserDoc(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
  plan: PlanType = 'free',
  photoURL?: string | null,
): Promise<User> {
  const createdAt = new Date().toISOString();

  // Doc públic: camps no sensibles del marketplace
  const publicUserData = {
    displayName,
    ...(photoURL ? { photoURL } : {}),
    role,
    plan,
    subscriptionStatus: 'none' as const,
    trialEndsAt: '',
    onboardingCompleted: false,
    createdAt,
  };

  // Doc privat: PII (email) — protegit per firestore rules
  const privateUserData = {
    email,
  };

  await Promise.all([
    setDoc(doc(db, 'users', uid), {
      ...publicUserData,
      _createdAt: serverTimestamp(),
    }),
    setDoc(doc(db, 'users', uid, 'private', 'profile'), {
      ...privateUserData,
      _createdAt: serverTimestamp(),
    }),
  ]);

  return {
    uid,
    email,
    displayName,
    role,
    plan,
    subscriptionStatus: 'none',
    trialEndsAt: '',
    onboardingCompleted: false,
    createdAt,
  };
}

// ── Auth methods ─────────────────────────────────────────

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  await activateSingleSession();
  const userDoc = await getUserDoc(cred.user.uid);
  if (!userDoc) throw new Error('User document not found in Firestore');
  return userDoc;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'player',
  // Es passa explícitament en comptes de donar-lo per fet: si algú registrés
  // saltant-se el formulari, el log ha de reflectir que la declaració no s'ha
  // fet, no una que ningú va marcar. El log és una prova, no un tràmit.
  ageDeclaredOver16: boolean,
): Promise<User> {
  if (!PUBLIC_REGISTRATION_ENABLED) {
    throw new Error('PUBLIC_REGISTRATION_DISABLED');
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Set displayName on Firebase Auth profile
  await updateProfile(cred.user, { displayName });

  // Send verification email automatically
  const url = `${window.location.origin}/auth/action`;
  await sendEmailVerification(cred.user, { url });

  // Create Firestore user document. Premium/trial access only comes from Stripe.
  const user = await createUserDoc(cred.user.uid, email, displayName, role, 'free', cred.user.photoURL);
  await activateSingleSession();
  await recordRegistrationConsent(ageDeclaredOver16);
  return user;
}

// L'accés amb Google es va retirar el 5 d'agost de 2026. `signInWithPopup` creava
// el compte si l'usuari era nou, i des de la pantalla d'accés això volia dir
// registrar-se sense passar per cap casella: ni consentiment (Art. 7) ni
// declaració d'edat. No era un cas hipotètic, era el camí que el botó feia.
//
// Es va valorar mantenir-lo rebutjant usuaris nous, i es va descartar: no hi
// havia cap compte registrat amb Google, el client no ho havia demanat mai, i
// hauria estat afegir codi per sostenir un camí que no serveix ningú.
//
// El proveïdor també s'ha de desactivar a Firebase Console → Authentication →
// Sign-in method. Sense això, treure el botó només l'amaga: la clau pública va
// al bundle i `signInWithPopup` seguiria funcionant des de fora de l'app.

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function ensureSingleSession(): Promise<void> {
  await activateSingleSession();
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
  if (user.plan === 'trial') {
    if (user.trialEndsAt) {
      const trialEnds = new Date(user.trialEndsAt).getTime();
      return trialEnds > Date.now();
    }
  }
  return false;
}
