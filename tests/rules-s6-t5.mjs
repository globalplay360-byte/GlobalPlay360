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
