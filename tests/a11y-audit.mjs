// Auditoria estàtica a11y S7-T4:
//  1. <button>/<a> icon-only (només conté SVG) sense aria-label ni text
//  2. outline-none sense focus-visible: equivalent (invisibilitza focus ring)
//  3. <input> sense label associada (requereix AST real, fem heurística simple)
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'src';
const findings = { high: [], medium: [], low: [] };

function walk(dir, fn) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'locales') walk(full, fn);
    } else if (/\.(tsx)$/.test(entry)) {
      fn(full);
    }
  }
}

walk(SRC, (file) => {
  const content = readFileSync(file, 'utf8');

  // ── 1. Icon-only buttons/links sense aria-label ──
  // Pattern: <button ...> ... <svg ...> ... </svg> ... </button>
  // però sense aria-label/aria-labelledby/title, i sense text-content visible.
  const tagRe = /<(button|Link|a)\b([\s\S]*?)>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = tagRe.exec(content)) !== null) {
    const tag = m[1];
    const attrs = m[2];
    const inner = m[3];

    // Salta si té aria-label, aria-labelledby o title
    if (/\baria-label\s*=/.test(attrs)) continue;
    if (/\baria-labelledby\s*=/.test(attrs)) continue;
    if (/\btitle\s*=/.test(attrs)) continue;

    // Conté SVG?
    const hasSvg = /<svg\b/.test(inner) || /<[A-Z]\w*Icon\b/.test(inner);
    if (!hasSvg) continue;

    // Text visible: treure tots els tags i veure si queda text no-whitespace.
    // També treure {t('...')} calls perquè poden ser labels dinàmics.
    const textOnly = inner
      .replace(/<[^>]+>/g, ' ')     // treu tags
      .replace(/\{[\s\S]*?\}/g, ' ') // treu expressions JSX (incl. t(...))
      .trim();

    if (textOnly.length > 0) continue; // hi ha text literal → label OK

    // Si l'inner conté expressions JSX com {t(...)}, {children}, {variable},
    // {obj.prop}, etc. entre tags, assumim que renderitzen text a runtime.
    if (/\bt\(['"`]/.test(inner) || /\{children\}/.test(inner)) continue;
    // Expressions {identifier} o {obj.prop} fora de className/style
    if (/>\s*\{[^{}]*\}\s*</.test(inner) || />\s*\{[^{}]*\}\s*$/.test(inner)) continue;

    // Finding real: icon-only sense label
    const lineNum = content.slice(0, m.index).split('\n').length;
    findings.high.push({
      type: `${tag} icon-only sense aria-label`,
      detail: m[0].slice(0, 100).replace(/\s+/g, ' ') + '...',
      where: `${file}:${lineNum}`,
    });
  }

  // ── 2. outline-none sense focus-visible: ──
  // Regla: si una línia té `outline-none` o `focus:outline-none` però NO hi ha
  // `focus-visible:` o `focus:ring` o `focus:border` al mateix element, és MEDIUM.
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (!/\b(focus:)?outline-none\b/.test(line)) return;

    // Mateixa línia o les 2 següents (className multiline) pot tenir focus-visible
    const neighborhood = lines.slice(idx, idx + 3).join(' ');
    const hasFocusRing =
      /\bfocus-visible:/.test(neighborhood) ||
      /\bfocus:(ring|border|outline-(?!none))/.test(neighborhood) ||
      /\bfocus:shadow/.test(neighborhood);

    if (!hasFocusRing) {
      findings.medium.push({
        type: 'outline-none sense focus-visible',
        detail: line.trim().slice(0, 120),
        where: `${file}:${idx + 1}`,
      });
    }
  });

  // ── 3. <input> sense label/aria-label ──
  // Busquem <input ...> sense aria-label, placeholder pot no ser accessible per screen readers.
  const inputRe = /<input\b([^>]*)\/?>/g;
  while ((m = inputRe.exec(content)) !== null) {
    const attrs = m[1];
    if (/\baria-label\s*=/.test(attrs)) continue;
    if (/\baria-labelledby\s*=/.test(attrs)) continue;
    if (/\btype\s*=\s*["']hidden["']/.test(attrs)) continue;

    // Heurística: si la mateixa línia o línia anterior té <label, assumim wrap.
    const lineNum = content.slice(0, m.index).split('\n').length;
    const prev2 = lines.slice(Math.max(0, lineNum - 3), lineNum).join(' ');
    const next2 = lines.slice(lineNum - 1, lineNum + 2).join(' ');
    const hasLabel = /<label\b/.test(prev2) || /<label\b/.test(next2) || /htmlFor\s*=/.test(prev2 + next2);

    if (!hasLabel) {
      findings.medium.push({
        type: 'input sense label/aria-label',
        detail: m[0].slice(0, 100),
        where: `${file}:${lineNum}`,
      });
    }
  }
});

// ── Report ──
console.log(`\n=== S7-T4 A11y Audit ===\n`);
const total = findings.high.length + findings.medium.length + findings.low.length;
console.log(`Total findings: ${total}`);
console.log(`  HIGH:   ${findings.high.length} (icon-only buttons sense aria-label — WCAG 4.1.2)`);
console.log(`  MEDIUM: ${findings.medium.length} (focus rings absents o inputs sense label — WCAG 2.4.7 / 3.3.2)\n`);

for (const sev of ['high', 'medium', 'low']) {
  if (findings[sev].length === 0) continue;
  console.log(`─── ${sev.toUpperCase()} ───`);
  for (const f of findings[sev].slice(0, 40)) {
    console.log(`  [${f.type}]`);
    console.log(`    ${f.detail}`);
    console.log(`    @ ${f.where}`);
  }
  if (findings[sev].length > 40) console.log(`  ... (${findings[sev].length - 40} més)`);
  console.log('');
}

if (findings.high.length === 0 && findings.medium.length === 0) {
  console.log('✅ S7-T4 PASS: cap finding rellevant.');
  process.exit(0);
} else if (findings.high.length === 0) {
  console.log(`⚠️  S7-T4 PARTIAL: només MEDIUM findings, revisar.`);
  process.exit(0);
} else {
  console.log(`❌ S7-T4 FAIL: ${findings.high.length} findings HIGH bloquejants.`);
  process.exit(1);
}
