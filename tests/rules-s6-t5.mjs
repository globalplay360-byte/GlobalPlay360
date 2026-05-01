// Automated Firestore rules test for S6-T5 backend paywall
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

const PROJECT_ID = 'globalplay360-test';

const env = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
});

// Seed baseline data as admin (bypasses rules)
let msgId;
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();

  // users públics
  await setDoc(doc(db, 'users', 'alice'), { displayName: 'Alice', role: 'player' });
  await setDoc(doc(db, 'users', 'bob'), { displayName: 'Bob', role: 'club' });
  await setDoc(doc(db, 'users', 'self_owner'), { displayName: 'Self', role: 'player' });

  // private docs (PII)
  await setDoc(doc(db, 'users', 'alice', 'private', 'profile'), { email: 'alice@test.com', phone: '+34 600 000 000' });
  await setDoc(doc(db, 'users', 'self_owner', 'private', 'profile'), { email: 'self@test.com' });

  // Conversa 1: participants alice + bob
  await setDoc(doc(db, 'conversations', 'conv1'), {
    participants: ['alice', 'bob'],
    lastMessage: 'hi',
    updatedAt: new Date(),
  });
  const msgRef = await addDoc(collection(db, 'conversations', 'conv1', 'messages'), {
    senderId: 'alice',
    text: 'secret',
    createdAt: new Date(),
  });
  msgId = msgRef.id;

  // Conversa 2: participants free_reader + bob (per provar Teaser Paywall)
  await setDoc(doc(db, 'conversations', 'conv_free'), {
    participants: ['free_reader', 'bob'],
    lastMessage: 'hi',
    updatedAt: new Date(),
  });

  // === Seed per tests S6-T6 (Applications role-based) ===
  await setDoc(doc(db, 'users', 'player_applicant'), { displayName: 'Player', role: 'player' });
  await setDoc(doc(db, 'users', 'coach_applicant'), { displayName: 'Coach', role: 'coach' });
  await setDoc(doc(db, 'users', 'club_fcb'), { displayName: 'FC Barcelona', role: 'club' });
  await setDoc(doc(db, 'users', 'club_real'), { displayName: 'Real Madrid', role: 'club' });
  await setDoc(doc(db, 'opportunities', 'opp1'), {
    clubId: 'club_fcb',
    title: 'Base sènior',
    sport: 'basketball',
    status: 'open',
    createdAt: new Date().toISOString(),
  });
});

console.log('\n=== S6-T5 Backend Paywall Rules Tests ===\n');

const results = [];
async function runCheck(label, operation, expected) {
  try {
    if (expected === 'allow') await assertSucceeds(operation());
    else await assertFails(operation());
    results.push({ label, expected: expected.toUpperCase(), status: 'PASS' });
  } catch (err) {
    results.push({ label, expected: expected.toUpperCase(), status: `FAIL: ${err.message.slice(0, 180)}` });
  }
}

// === MISSATGERIA ===
// 1. Free participant llegint messages → DENY
await runCheck(
  '[messages.read] Free participant (alice) → DENY',
  () => getDoc(doc(env.authenticatedContext('alice').firestore(), `conversations/conv1/messages/${msgId}`)),
  'deny',
);

// 2. Premium participant llegint messages → ALLOW
await runCheck(
  '[messages.read] Premium participant (bob, stripeRole=premium) → ALLOW',
  () =>
    getDoc(
      doc(env.authenticatedContext('bob', { stripeRole: 'premium' }).firestore(), `conversations/conv1/messages/${msgId}`),
    ),
  'allow',
);

// 3. Premium però NO participant → DENY
await runCheck(
  '[messages.read] Premium no-participant → DENY',
  () =>
    getDoc(
      doc(
        env.authenticatedContext('premiumstranger', { stripeRole: 'premium' }).firestore(),
        `conversations/conv1/messages/${msgId}`,
      ),
    ),
  'deny',
);

// === CONVERSATIONS metadata ===
// 4. Free participant llegint la conversa → ALLOW (preservant Teaser Paywall UX)
await runCheck(
  '[conversations.read] Free participant (free_reader) → ALLOW (Teaser Paywall)',
  () => getDoc(doc(env.authenticatedContext('free_reader').firestore(), 'conversations/conv_free')),
  'allow',
);

// 5. Free crea nova conversa → DENY
await runCheck(
  '[conversations.create] Free → DENY',
  () =>
    setDoc(doc(env.authenticatedContext('newfree').firestore(), 'conversations/new_by_free'), {
      participants: ['newfree', 'bob'],
      lastMessage: '',
      updatedAt: new Date(),
    }),
  'deny',
);

// 6. Premium crea nova conversa → ALLOW
await runCheck(
  '[conversations.create] Premium → ALLOW',
  () =>
    setDoc(
      doc(env.authenticatedContext('newpremium', { stripeRole: 'premium' }).firestore(), 'conversations/new_by_premium'),
      { participants: ['newpremium', 'bob'], lastMessage: '', updatedAt: new Date() },
    ),
  'allow',
);

// === PRIVATE PROFILE (PII) ===
// 7. Free stranger NO pot llegir el private d'un altre → DENY
await runCheck(
  '[users/alice/private/profile] Free stranger → DENY',
  () => getDoc(doc(env.authenticatedContext('freestranger').firestore(), 'users/alice/private/profile')),
  'deny',
);

// 8. Owner llegeix el seu propi private → ALLOW
await runCheck(
  '[users/self_owner/private/profile] Owner → ALLOW',
  () => getDoc(doc(env.authenticatedContext('self_owner').firestore(), 'users/self_owner/private/profile')),
  'allow',
);

// 9. Premium stranger SÍ pot llegir private d'altri (hasPremium) → ALLOW
await runCheck(
  '[users/alice/private/profile] Premium stranger → ALLOW',
  () =>
    getDoc(
      doc(env.authenticatedContext('prem_viewer', { stripeRole: 'premium' }).firestore(), 'users/alice/private/profile'),
    ),
  'allow',
);

// 10. Unauth → DENY (defense against non-logged attacker)
await runCheck(
  '[users/alice/private/profile] Unauthenticated → DENY',
  () => getDoc(doc(env.unauthenticatedContext().firestore(), 'users/alice/private/profile')),
  'deny',
);

// === S6-T6: APPLICATIONS — ROLE-BASED CREATE ===
const makeApp = (userId, clubId) => ({
  opportunityId: 'opp1',
  userId,
  clubId,
  status: 'submitted',
  createdAt: new Date().toISOString(),
  message: 'Hola',
});

// 11. Club aplicant amb el seu propi uid com a userId → DENY (role=='club')
await runCheck(
  '[applications.create] Club (role=club) amb userId=self → DENY',
  () =>
    setDoc(
      doc(env.authenticatedContext('club_fcb').firestore(), 'applications/app_club_self'),
      makeApp('club_fcb', 'club_real'),
    ),
  'deny',
);

// 12. Club aplicant a una oferta d'un altre club posant el seu uid com a userId → DENY
await runCheck(
  '[applications.create] Club aplicant a oferta d\'altre club → DENY',
  () =>
    setDoc(
      doc(env.authenticatedContext('club_real').firestore(), 'applications/app_club_cross'),
      makeApp('club_real', 'club_fcb'),
    ),
  'deny',
);

// 13. Club intentant suplantar un player (userId ≠ auth.uid) → DENY (auth check)
await runCheck(
  '[applications.create] Club suplantant player (userId mismatch) → DENY',
  () =>
    setDoc(
      doc(env.authenticatedContext('club_fcb').firestore(), 'applications/app_impersonate'),
      makeApp('player_applicant', 'club_real'),
    ),
  'deny',
);

// 14. Player aplicant a una oferta → ALLOW
await runCheck(
  '[applications.create] Player (role=player) → ALLOW',
  () =>
    setDoc(
      doc(env.authenticatedContext('player_applicant').firestore(), 'applications/app_player_ok'),
      makeApp('player_applicant', 'club_fcb'),
    ),
  'allow',
);

// 15. Coach aplicant a una oferta → ALLOW (role=coach no és club)
await runCheck(
  '[applications.create] Coach (role=coach) → ALLOW',
  () =>
    setDoc(
      doc(env.authenticatedContext('coach_applicant').firestore(), 'applications/app_coach_ok'),
      makeApp('coach_applicant', 'club_fcb'),
    ),
  'allow',
);

// 16. User sense doc a Firestore (attack via auth només) → DENY (exists() check)
await runCheck(
  '[applications.create] Auth sense doc users/{uid} → DENY',
  () =>
    setDoc(
      doc(env.authenticatedContext('ghost_user').firestore(), 'applications/app_ghost'),
      makeApp('ghost_user', 'club_fcb'),
    ),
  'deny',
);

// === S6-T7: USERS/{UID} — ROLE / PLAN / EMAIL IMMUTABLES ===
// Seed un usuari "victim" amb role=player que intentarà escalar a club.
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'users', 'victim_player'), {
    displayName: 'Victim',
    role: 'player',
    plan: 'free',
    email: 'victim@test.com', // legacy — abans del schema split
    bio: 'old bio',
  });
});

// Importo updateDoc dinàmicament (no l'he importat al top)
const { updateDoc } = await import('firebase/firestore');

// 17. Canviar role 'player' → 'club' sobre el propi doc → DENY
await runCheck(
  "[users.update] Self role 'player' → 'club' → DENY (immutable)",
  () => updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), { role: 'club' }),
  'deny',
);

// 18. Canviar role 'player' → 'admin' → DENY (escalada màxima)
await runCheck(
  "[users.update] Self role → 'admin' → DENY (escalada impossible)",
  () => updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), { role: 'admin' }),
  'deny',
);

// 19. Canviar plan 'free' → 'premium' per autoregalar-se Premium → DENY
await runCheck(
  "[users.update] Self plan 'free' → 'premium' → DENY (billing bypass)",
  () => updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), { plan: 'premium' }),
  'deny',
);

// 20. Canviar email → DENY (account takeover)
await runCheck(
  '[users.update] Self email → attacker@evil.com → DENY',
  () =>
    updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), {
      email: 'attacker@evil.com',
    }),
  'deny',
);

// 21. Canviar role d'un ALTRE usuari → DENY (no és propietari)
await runCheck(
  "[users.update] Modificar role d'un ALTRE usuari → DENY",
  () => updateDoc(doc(env.authenticatedContext('attacker_uid').firestore(), 'users/victim_player'), { role: 'club' }),
  'deny',
);

// 22. Actualitzar camps editables (bio, displayName) amb role idèntic → ALLOW
await runCheck(
  '[users.update] Self bio + displayName (role inalterat) → ALLOW',
  () =>
    updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), {
      bio: 'new bio actualitzada',
      displayName: 'Victim Renamed',
    }),
  'allow',
);

// 23. Payload combinat: bio nova + role sense canviar explícitament → ALLOW
await runCheck(
  '[users.update] Self bio + role explícit (mateix valor) → ALLOW',
  () =>
    updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), {
      bio: 'una altra bio',
      role: 'player', // mateix valor → passa
    }),
  'allow',
);

// 24. Payload combinat tracrós: bio legítim + role canvi encobert → DENY
await runCheck(
  '[users.update] Self bio legit + role encobert a club → DENY (rule detecta)',
  () =>
    updateDoc(doc(env.authenticatedContext('victim_player').firestore(), 'users/victim_player'), {
      bio: 'innocent update',
      role: 'club', // intent d'amagar el canvi de role entre camps legítims
    }),
  'deny',
);

// === REPORT ===
console.log('');
console.log('────────────────────────────────────────────────────────────');
console.log('RESULTS');
console.log('────────────────────────────────────────────────────────────');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${r.expected.padEnd(5)}] ${r.label}`);
  if (r.status !== 'PASS') console.log(`   → ${r.status}`);
}

await env.cleanup();

const failed = results.filter((r) => r.status !== 'PASS').length;
if (failed > 0) {
  console.log(`\n❌ ${failed}/${results.length} tests failed`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${results.length} tests passed`);
  process.exit(0);
}
