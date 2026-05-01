// S8-T4: verifica que les pàgines legals contenen el contingut mínim
// requerit per Stripe (live mode Customer Portal) i GDPR (RGPD Art. 13).
import { readFileSync } from 'fs';

const privacy = readFileSync('src/content/legal/privacy.content.ts', 'utf8');
const terms = readFileSync('src/content/legal/terms.content.ts', 'utf8');
const cookies = readFileSync('src/content/legal/cookies.content.ts', 'utf8');

const checks = [
  // GDPR / RGPD (Privacy)
  { doc: 'privacy', label: 'RGPD — Base legal del tractament', re: /base\s*legal|lawful\s*basis|legitima?ci[oó]n/i },
  { doc: 'privacy', label: 'RGPD — Drets de l\'usuari (accés/rectificació/supressió/oposició)', re: /\b(drets|derechos|rights)\b[\s\S]{0,300}?(acc[eé]s|accesso|access|rectifica|supressi|supresi|erasure|oposici|objecci|object)/i },
  { doc: 'privacy', label: 'RGPD — DPO / Delegat de Protecció de Dades', re: /DPO|Delegat|Delegad[oa]|Data Protection Officer/i },
  { doc: 'privacy', label: 'RGPD — Termini de retenció de dades', re: /retenci[oó]|retention|conservaci/i },
  { doc: 'privacy', label: 'RGPD — Transferència internacional', re: /transfer[eè]ncia|transfer|internacional|international/i },
  { doc: 'privacy', label: 'RGPD — AEPD / autoritat control', re: /AEPD|autoritat|autoridad|authority/i },

  // Stripe live mode (Terms)
  { doc: 'terms', label: 'Stripe — Condicions de subscripció', re: /subscripci[oó]|subscription|Stripe/i },
  { doc: 'terms', label: 'Stripe — Cancel·lació / devolucions', re: /cancel\.?laci|cancela|cancel|refund|devoluci|reembols/i },
  { doc: 'terms', label: 'Stripe — Política de facturació / IVA', re: /IVA|VAT|factura|invoice|tax/i },
  { doc: 'terms', label: 'Stripe — Customer Portal esmentat', re: /customer\s*portal|portal\s+del\s+clien/i },

  // Cookies (Cookies policy)
  { doc: 'cookies', label: 'Cookies — Categories (tècniques/analítiques/màrqueting)', re: /t[eè]cni|necessar|analytic|anal[ií]ti|marketing|m[aà]rq/i },
  { doc: 'cookies', label: 'Cookies — Gestió i revocació', re: /gesti|manage|revoc|retirar/i },
  { doc: 'cookies', label: 'Cookies — Durada de les cookies', re: /durad[ao]|duraci|duration|vencimiento|expir/i },

  // Anti-placeholders
  { doc: 'privacy', label: 'Sense "Lorem ipsum"', re: /lorem\s*ipsum/i, negate: true },
  { doc: 'terms', label: 'Sense "Lorem ipsum"', re: /lorem\s*ipsum/i, negate: true },
  { doc: 'cookies', label: 'Sense "Lorem ipsum"', re: /lorem\s*ipsum/i, negate: true },
  { doc: 'privacy', label: 'Sense [PENDENT_*] text-pla', re: /\[PENDENT_[A-Z_]+\]/, negate: true },
  { doc: 'terms', label: 'Sense [PENDENT_*] text-pla', re: /\[PENDENT_[A-Z_]+\]/, negate: true },
  { doc: 'cookies', label: 'Sense [PENDENT_*] text-pla', re: /\[PENDENT_[A-Z_]+\]/, negate: true },
];

const sources = { privacy, terms, cookies };

let failed = 0;
console.log(`\n=== S8-T4 Legal Content Audit (GDPR + Stripe) ===\n`);

for (const c of checks) {
  const found = c.re.test(sources[c.doc]);
  const ok = c.negate ? !found : found;
  console.log(`${ok ? '✅' : '❌'} [${c.doc}] ${c.label}`);
  if (!ok) failed++;
}

console.log('');
if (failed === 0) {
  console.log(`✅ S8-T4 PASS: contingut legal complet (GDPR + Stripe + sense placeholders).`);
  process.exit(0);
} else {
  console.log(`❌ S8-T4 FAIL: ${failed} check(s) falten.`);
  process.exit(1);
}
