// Test de les regles d'edat mínima (16 anys) sobre `users/{uid}/private/*`.
//
// Per què existeix: al registre l'edat és una declaració que ningú verifica; el
// perfil és l'únic lloc on el servidor la pot contrastar amb una dada, i per tant
// `meetsMinimumAge()` és l'única porta real que hi ha. Una porta sense test es
// podreix — i aquesta compara cadenes i fa aritmètica d'anys, que és exactament
// el tipus de codi que sembla correcte llegint-lo.
//
// Requisit: emulador de Firestore escoltant a 127.0.0.1:8080
//   firebase emulators:start --only firestore
//   node tests/rules-minimum-age.mjs
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'globalplay360-test';

// La rule compara per ANY, no per dia. Les dates es deriven de l'any en curs
// perquè el test no caduqui: amb valors fixos, passaria fins al 2027 i llavors
// començaria a mentir sense que ningú el toqués.
const YEAR = new Date().getFullYear();
const ADULT = `${YEAR - 25}-06-15T00:00:00.000Z`;
const EXACTLY_16 = `${YEAR - 16}-12-31T00:00:00.000Z`; // límit que ha de passar
const ALMOST_16 = `${YEAR - 15}-01-01T00:00:00.000Z`; // límit que ha de caure
const CHILD = `${YEAR - 10}-03-01T00:00:00.000Z`;

const env = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
});

// `hasValidSingleSession()` exigeix un doc a `auth_sessions/{uid}` i que
// `auth_time` del token hi sigui posterior. Sense això, els updates cauen per
// un motiu que no és l'edat i el test provaria una altra cosa.
const NOW_SECONDS = Math.floor(Date.now() / 1000);
const UIDS = ['adult', 'minor', 'legacy_minor', 'editor', 'boundary_ok', 'boundary_ko'];

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  for (const uid of UIDS) {
    await setDoc(doc(db, 'auth_sessions', uid), { validAfterSeconds: 0 });
    await setDoc(doc(db, 'users', uid), { displayName: uid, role: 'player' });
  }
  // Perfil ja existent SENSE data, per provar l'alta d'una data nova.
  await setDoc(doc(db, 'users', 'editor', 'private', 'profile'), { phone: '+34 600 000 000' });
  // Perfil que JA porta una data de menys de 16 des d'abans de la política.
  // Serveix per comprovar que no el deixem bloquejat fora del seu propi perfil.
  await setDoc(doc(db, 'users', 'legacy_minor', 'private', 'profile'), {
    phone: '+34 600 000 001',
    dateOfBirth: CHILD,
  });
});

const session = (uid) => env.authenticatedContext(uid, { auth_time: NOW_SECONDS }).firestore();

console.log('\n=== Rules · edat mínima de registre (16 anys) ===\n');

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

// === CREATE ===
await runCheck(
  '[create] 25 anys → ALLOW',
  () => setDoc(doc(session('adult'), 'users/adult/private/profile'), { dateOfBirth: ADULT }),
  'allow',
);

await runCheck(
  '[create] 10 anys → DENY',
  () => setDoc(doc(session('minor'), 'users/minor/private/profile'), { dateOfBirth: CHILD }),
  'deny',
);

// Clubs i entrenadors no donen mai la data: el perfil ha de poder existir sense.
await runCheck(
  '[create] sense dateOfBirth → ALLOW',
  () => setDoc(doc(session('boundary_ok'), 'users/boundary_ok/private/profile'), { phone: '+34 600 111 222' }),
  'allow',
);

// === EL LÍMIT ===
// La rule és per any, o sigui que qui neix el 31 de desembre de l'any-16 passa.
// És el marge documentat, i va a favor de l'usuari.
await runCheck(
  `[create] neix el ${YEAR - 16} (límit exacte) → ALLOW`,
  () => setDoc(doc(session('boundary_ok'), 'users/boundary_ok/private/profile'), { dateOfBirth: EXACTLY_16 }),
  'allow',
);

await runCheck(
  `[create] neix el ${YEAR - 15} (un any curt) → DENY`,
  () => setDoc(doc(session('boundary_ko'), 'users/boundary_ko/private/profile'), { dateOfBirth: ALMOST_16 }),
  'deny',
);

// === UPDATE ===
await runCheck(
  '[update] afegir una data de menys de 16 → DENY',
  () => updateDoc(doc(session('editor'), 'users/editor/private/profile'), { dateOfBirth: CHILD }),
  'deny',
);

await runCheck(
  '[update] afegir una data vàlida → ALLOW',
  () => updateDoc(doc(session('editor'), 'users/editor/private/profile'), { dateOfBirth: ADULT }),
  'allow',
);

// La comprovació que justifica la guarda d'`affectedKeys`: un perfil que ja
// portava una data antiga de menys de 16 ha de poder editar la resta de camps.
// Sense la guarda, `request.resource.data` (el document sencer resultant) el
// deixaria bloquejat fora del seu propi perfil amb un error de permisos sec.
await runCheck(
  '[update] perfil amb data antiga <16, editant un altre camp → ALLOW',
  () => updateDoc(doc(session('legacy_minor'), 'users/legacy_minor/private/profile'), { phone: '+34 600 999 888' }),
  'allow',
);

await runCheck(
  '[update] perfil amb data antiga <16, tocant la data i deixant-la <16 → DENY',
  () => updateDoc(doc(session('legacy_minor'), 'users/legacy_minor/private/profile'), { dateOfBirth: ALMOST_16 }),
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
