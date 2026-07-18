/**
 * Crea 3 comptes QA (player / coach / club) a Auth + Firestore.
 * node scripts/create-qa-accounts.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

function loadEnv() {
  const raw = readFileSync('.env', 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const PASSWORD = 'QaTest2026!Gp360';
const STAMP = Date.now().toString(36);

const ACCOUNTS = [
  { role: 'player', email: `qa.player.${STAMP}@gp360.test`, displayName: 'QA Player GP360' },
  { role: 'coach', email: `qa.coach.${STAMP}@gp360.test`, displayName: 'QA Coach GP360' },
  { role: 'club', email: `qa.club.${STAMP}@gp360.test`, displayName: 'QA Club GP360' },
];

async function ensureUser(auth, db, functions, account) {
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, account.email, PASSWORD);
  } catch (err) {
    if (err?.code === 'auth/email-already-in-use') {
      cred = await signInWithEmailAndPassword(auth, account.email, PASSWORD);
    } else {
      throw err;
    }
  }

  const { uid } = cred.user;
  await updateProfile(cred.user, { displayName: account.displayName });

  // create: permès sense single-session; read sí que l'exigeix → no fem getDoc abans
  await Promise.all([
    setDoc(doc(db, 'users', uid), {
      displayName: account.displayName,
      role: account.role,
      plan: 'free',
      subscriptionStatus: 'none',
      trialEndsAt: '',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      _createdAt: serverTimestamp(),
      _qa: true,
    }, { merge: true }),
    setDoc(doc(db, 'users', uid, 'private', 'profile'), {
      email: account.email,
      _createdAt: serverTimestamp(),
    }, { merge: true }),
  ]);

  // Activa single-session perquè el login a l'app pugui llegir el perfil
  try {
    const activate = httpsCallable(functions, 'activateSingleSession');
    await activate({ deviceId: `qa-script-${uid.slice(0, 8)}` });
  } catch (err) {
    console.warn(`activateSingleSession fallit per ${account.role}:`, err?.message || err);
  }

  await signOut(auth);
  return { ...account, uid, password: PASSWORD };
}

async function main() {
  const env = loadEnv();
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app, 'europe-west1');

  const created = [];
  for (const account of ACCOUNTS) {
    const row = await ensureUser(auth, db, functions, account);
    created.push(row);
    console.log(`OK ${row.role}: ${row.email} (${row.uid})`);
  }

  writeFileSync(
    'scripts/qa-accounts.generated.json',
    JSON.stringify({ createdAt: new Date().toISOString(), password: PASSWORD, accounts: created }, null, 2),
  );
  console.log('\nDesat a scripts/qa-accounts.generated.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
