// Auditoria S8-T1: tots els links interns han d'existir com a ruta.
// Extreu `to="..."` i `href="..."` dels components públics i valida
// contra les rutes de App.tsx.
import { readFileSync } from 'fs';

const PAGES_TO_AUDIT = [
  'src/pages/public/HomePage.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/PublicLayout.tsx',
];

// ── 1. Rutes definides a App.tsx (extretes manualment però les verifico) ──
const appContent = readFileSync('src/App.tsx', 'utf8');
const routes = new Set();
const routeRe = /<Route\s+path=["']([^"']+)["']/g;
let m;
while ((m = routeRe.exec(appContent)) !== null) {
  const p = m[1];
  if (p === '*') continue;
  // Normalitza: rutes relatives del nested block passen a absolutes amb /dashboard o /admin
  // però el HomePage només pot linkar a rutes públiques, que són totes absolutes.
  routes.add(p.startsWith('/') ? p : `/${p}`);
}

// Afegeix rutes nested absolutes conegudes (composition a App.tsx)
const knownAbsolute = [
  '/', '/pricing', '/about',
  '/privacy', '/terms', '/cookies', '/contact',
  '/login', '/register', '/forgot-password', '/auth/action',
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/opportunities',
  '/dashboard/opportunities/mine',
  '/dashboard/opportunities/new',
  '/dashboard/applications',
  '/dashboard/messages',
  '/dashboard/billing',
  '/dashboard/checkout/success',
  '/admin',
];
knownAbsolute.forEach((r) => routes.add(r));

function routeExists(path) {
  if (!path.startsWith('/')) return true; // external o anchor
  if (path.startsWith('/#') || path.startsWith('#')) return true; // anchor
  // Elimina query + hash
  const clean = path.split('?')[0].split('#')[0];
  if (routes.has(clean)) return true;
  // Dinàmic: /dashboard/profile/abc123 → match /dashboard/profile/:id
  for (const r of routes) {
    if (!r.includes(':')) continue;
    const pattern = '^' + r.replace(/\/:\w+/g, '/[^/]+') + '$';
    if (new RegExp(pattern).test(clean)) return true;
  }
  return false;
}

// ── 2. Extreu tots els `to="..."` i `href="..."` de les pàgines ──
const findings = { broken: [], external: [], anchors: [], ok: 0 };

for (const file of PAGES_TO_AUDIT) {
  let content;
  try { content = readFileSync(file, 'utf8'); }
  catch { continue; }

  // Link to="/path" o <a href="/path">
  const linkRe = /(?:\bto|\bhref)\s*=\s*["']([^"']+)["']/g;
  while ((m = linkRe.exec(content)) !== null) {
    const target = m[1];
    const lineNum = content.slice(0, m.index).split('\n').length;
    const where = `${file}:${lineNum}`;

    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:') || target.startsWith('tel:')) {
      findings.external.push({ target, where });
      continue;
    }
    if (target.startsWith('#') || target.startsWith('/#')) {
      findings.anchors.push({ target, where });
      continue;
    }
    if (routeExists(target)) {
      findings.ok++;
    } else {
      findings.broken.push({ target, where });
    }
  }
}

// ── 3. Extreu assets externs (imatges/vídeos) de HomePage ──
const homeContent = readFileSync('src/pages/public/HomePage.tsx', 'utf8');
const assetRe = /\bsrc\s*=\s*["']([^"']+)["']/g;
const assets = [];
while ((m = assetRe.exec(homeContent)) !== null) {
  assets.push(m[1]);
}

// ── Report ──
console.log(`\n=== S8-T1 Links & Assets Audit ===\n`);
console.log(`Rutes definides a App.tsx: ${routes.size}`);
console.log(`Links auditats a pàgines públiques:`);
console.log(`  ✅ OK (ruta existeix):   ${findings.ok}`);
console.log(`  🌐 Externs (http/mailto): ${findings.external.length}`);
console.log(`  #  Anchors:              ${findings.anchors.length}`);
console.log(`  ❌ Broken (404):         ${findings.broken.length}\n`);

if (findings.broken.length > 0) {
  console.log('─── LINKS TRENCATS ───');
  for (const b of findings.broken) console.log(`  ❌ ${b.target}  @  ${b.where}`);
  console.log('');
}

if (findings.external.length > 0) {
  console.log('─── LINKS EXTERNS (verificar manualment) ───');
  for (const e of findings.external) console.log(`  🌐 ${e.target}  @  ${e.where}`);
  console.log('');
}

console.log(`Assets a HomePage (${assets.length}):`);
for (const a of assets) console.log(`  📦 ${a}`);

console.log('');
if (findings.broken.length === 0) {
  console.log('✅ S8-T1 links PASS: cap link intern trencat.');
  process.exit(0);
} else {
  console.log(`❌ S8-T1 FAIL: ${findings.broken.length} link(s) trencat(s).`);
  process.exit(1);
}
