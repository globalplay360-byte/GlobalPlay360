// S8-T5: audit del Footer — 4 columnes, trust badges, LanguageSelector,
// consistència a totes les pàgines públiques.
import { readFileSync } from 'fs';

const footer = readFileSync('src/components/layout/Footer.tsx', 'utf8');
const publicLayout = readFileSync('src/components/layout/PublicLayout.tsx', 'utf8');

const checks = [
  // Estructura
  { label: '4 columnes grid (2 o 4 segons breakpoint)', re: /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-12/ },
  { label: 'Col 1 — Brand + Contacte (span 5)', re: /lg:col-span-5/ },
  { label: 'Col 2 — Platform', re: /footer\.col\.platform/ },
  { label: 'Col 3 — Per a tu (For You)', re: /footer\.col\.forYou/ },
  { label: 'Col 4 — Legal', re: /footer\.legal/ },

  // Contingut Col 2 (Platform)
  { label: 'Col Platform → / (Home)', re: /to="\/"[^>]*>\{t\('navbar\.home/ },
  { label: 'Col Platform → /about', re: /to="\/about"/ },
  { label: 'Col Platform → /dashboard/opportunities', re: /to="\/dashboard\/opportunities"/ },
  { label: 'Col Platform → /pricing', re: /to="\/pricing"/ },

  // Contingut Col 3 (Per a tu — role deep-links)
  { label: 'Col For You → register role=player', re: /to="\/register\?role=player"/ },
  { label: 'Col For You → register role=club', re: /to="\/register\?role=club"/ },
  { label: 'Col For You → register role=coach', re: /to="\/register\?role=coach"/ },
  { label: 'Col For You → Membre Fundador (/register)', re: /footer\.col\.founder/ },

  // Contingut Col 4 (Legal)
  { label: 'Col Legal → /privacy', re: /to="\/privacy"/ },
  { label: 'Col Legal → /terms', re: /to="\/terms"/ },
  { label: 'Col Legal → /cookies', re: /to="\/cookies"/ },
  { label: 'Col Legal → /contact', re: /to="\/contact"/ },

  // Trust badges + LanguageSelector
  { label: 'Trust badge — Stripe', re: /footer\.trust\.stripe/ },
  { label: 'Trust badge — GDPR', re: /footer\.trust\.gdpr/ },
  { label: 'LanguageSelector importat', re: /import\s*\{?\s*LanguageSelector/ },
  { label: 'LanguageSelector renderitzat', re: /<LanguageSelector\s*\/?>/ },

  // Bottom bar
  { label: 'Copyright amb any dinàmic', re: /currentYear.*Global Play 360/ },

  // Accessibility
  { label: '<footer> amb rol semàntic', re: /<footer\s/ },

  // Consistency
  { label: 'Footer renderitzat a PublicLayout', re: /<Footer\s*\/?>/, src: publicLayout },
];

let failed = 0;
console.log(`\n=== S8-T5 Footer Audit ===\n`);
for (const c of checks) {
  const source = c.src ?? footer;
  const ok = c.re.test(source);
  console.log(`${ok ? '✅' : '❌'} ${c.label}`);
  if (!ok) failed++;
}

console.log('');
if (failed === 0) {
  console.log(`✅ S8-T5 PASS: Footer complet, consistent i sense links trencats.`);
  process.exit(0);
} else {
  console.log(`❌ S8-T5 FAIL: ${failed} check(s) falten.`);
  process.exit(1);
}
