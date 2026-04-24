// Auditoria i18n S7-T1: extreu totes les claus t('...') del codi i detecta
// les que falten als locales ca / es / en.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const LOCALES = ['ca', 'es', 'en'];
const SRC = 'src';

// ── 1. Carregar locales ──────────────────────────────────
const locales = {};
for (const loc of LOCALES) {
  locales[loc] = JSON.parse(readFileSync(`src/locales/${loc}/common.json`, 'utf8'));
}

function hasKey(obj, dottedKey) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object' || !(p in cur)) return false;
    cur = cur[p];
  }
  return typeof cur === 'string';
}

// ── 2. Walkar tot src i recollir claus t('...') ──────────
const keys = new Map(); // key -> array of file:line

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'locales') walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const content = readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // t('key') o t("key") o t(`key`) — amb o sense 2n argument.
        // Evitem backticks perquè sovint són templates dinàmics amb ${...}
        const re = /\bt\(\s*['"]([a-zA-Z0-9._-]+)['"]/g;
        let m;
        while ((m = re.exec(line)) !== null) {
          const k = m[1];
          // Descarta claus buides o amb punt final (dinàmiques)
          if (!k || k.endsWith('.')) continue;
          if (!keys.has(k)) keys.set(k, []);
          keys.get(k).push(`${full}:${idx + 1}`);
        }
      });
    }
  }
}

walk(SRC);

// ── 3. Detectar claus que falten en alguna locale ────────
const missing = { ca: [], es: [], en: [] };
const keySorted = Array.from(keys.keys()).sort();

for (const k of keySorted) {
  for (const loc of LOCALES) {
    if (!hasKey(locales[loc], k)) {
      missing[loc].push({ key: k, locations: keys.get(k) });
    }
  }
}

// ── 4. Detectar claus al JSON NO usades al codi (cleanup info) ────────
function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.push(full);
    else if (typeof v === 'object' && v != null) out.push(...flatten(v, full));
  }
  return out;
}

const caKeys = flatten(locales.ca);
const orphans = caKeys.filter((k) => !keys.has(k));

// ── 5. Report ─────────────────────────────────────────────
console.log(`\n=== S7-T1 i18n Audit ===\n`);
console.log(`Total claus usades al codi: ${keys.size}`);
console.log(`Total claus al locale CA: ${caKeys.length}\n`);

let totalMissing = 0;
for (const loc of LOCALES) {
  if (missing[loc].length === 0) {
    console.log(`✅ ${loc.toUpperCase()}: totes les claus presents`);
  } else {
    totalMissing += missing[loc].length;
    console.log(`❌ ${loc.toUpperCase()}: ${missing[loc].length} claus FALTEN`);
    for (const m of missing[loc].slice(0, 50)) {
      console.log(`   ▸ ${m.key}`);
      m.locations.slice(0, 2).forEach((l) => console.log(`       @ ${l}`));
    }
    if (missing[loc].length > 50) console.log(`   ... (${missing[loc].length - 50} més)`);
  }
  console.log('');
}

if (orphans.length > 0) {
  console.log(`⚠️  ${orphans.length} claus al JSON NO usades al codi (cleanup info, no és error):`);
  orphans.slice(0, 20).forEach((k) => console.log(`   ▸ ${k}`));
  if (orphans.length > 20) console.log(`   ... (${orphans.length - 20} més)`);
}

console.log('');
if (totalMissing === 0) {
  console.log(`✅ S7-T1 PASS: cap clau sense resoldre als 3 locales.`);
  process.exit(0);
} else {
  console.log(`❌ S7-T1 FAIL: ${totalMissing} clau(s) falten en total.`);
  process.exit(1);
}
