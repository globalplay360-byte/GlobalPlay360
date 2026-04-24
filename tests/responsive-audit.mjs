// Auditoria estàtica de patrons que causen overflow horitzontal a < 640px.
// No substitueix QA visual, però detecta gaps UX més comuns a codi.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'src';
const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'locales') walk(full);
    } else if (/\.(tsx|ts)$/.test(entry)) {
      const content = readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const here = `${full}:${idx + 1}`;

        // 1. min-w-[Npx] amb N > 300 → pot causar overflow a mòbil de 375px
        const minWPx = line.match(/\bmin-w-\[(\d+)px\]/);
        if (minWPx && parseInt(minWPx[1]) > 300) {
          findings.push({ severity: 'high', type: 'min-w excessiva', detail: `${minWPx[0]} — potser overflow a <375px`, where: here });
        }

        // 2. w-[Npx] fixe amb N > 360 i sense max-w:
        const wPx = line.match(/\bw-\[(\d+)px\]/);
        if (wPx && parseInt(wPx[1]) > 360 && !line.includes('max-w-') && !line.includes('sm:')) {
          findings.push({ severity: 'medium', type: 'width fixa', detail: `${wPx[0]} sense max-w/responsive`, where: here });
        }

        // 3. whitespace-nowrap sobre text llarg sense truncate
        if (line.includes('whitespace-nowrap') && !line.includes('truncate') && !line.includes('overflow-hidden') && !line.includes('shrink-0')) {
          // Exceptuem textos clarament curts (data, badges, ...)
          findings.push({ severity: 'low', type: 'nowrap sense truncate', detail: 'potser tall horitzontal si el text creix', where: here });
        }

        // 4. grid-cols-N amb N >= 4 sense responsive prefix (hauria de començar amb 1-2 a mòbil)
        const gridMatch = line.match(/\bgrid-cols-(\d+)\b/);
        if (gridMatch && parseInt(gridMatch[1]) >= 4) {
          // Check if preceded by mobile-first default (sm:/md:/lg:)
          const isResponsive = /(sm|md|lg|xl):grid-cols-/.test(line);
          const hasMobileFallback = line.includes('grid-cols-1') || line.includes('grid-cols-2');
          if (!isResponsive && !hasMobileFallback) {
            findings.push({ severity: 'high', type: 'grid-cols fixe ≥4', detail: gridMatch[0] + ' sense fallback 1/2 cols', where: here });
          }
        }

        // 5. flex sense flex-wrap amb molts children potencials
        // Skip — massa soroll, requeriría AST

        // 6. text-Nxl (N≥3) sense responsive (sm:text-...) → titulars massa grans mòbil
        const txtMatch = line.match(/\btext-(\d)xl\b/);
        if (txtMatch && parseInt(txtMatch[1]) >= 4) {
          const hasResponsivePrefix = /(sm|md|lg):text-/.test(line) || /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/.test(line);
          if (!hasResponsivePrefix) {
            findings.push({ severity: 'medium', type: 'titular massa gran sense escalar', detail: `${txtMatch[0]} sense sm:/base variant`, where: here });
          }
        }

        // 7. px-N o p-N amb N ≥ 10 (padding excessiu a mòbil)
        const pxMatch = line.match(/\bp[xy]?-(\d+)\b/);
        if (pxMatch && parseInt(pxMatch[1]) >= 10) {
          const hasResponsive = /(sm|md|lg):p[xy]?-/.test(line) || /\bp[xy]?-[2-6]\b/.test(line);
          if (!hasResponsive) {
            findings.push({ severity: 'low', type: 'padding gran no-responsive', detail: `${pxMatch[0]} potser massa a mòbil`, where: here });
          }
        }

        // 8. horitzontal scroll: overflow-x-auto → OK (és la mitigació)
        // Detectem taules/llistes sense overflow-x-auto
        if ((line.includes('<table') || line.includes('<Table')) && !content.includes('overflow-x-auto')) {
          findings.push({ severity: 'medium', type: 'table sense overflow wrapper', detail: 'podria causar scroll horitzontal page-level', where: here });
        }
      });
    }
  }
}

walk(SRC);

// ─── Report ───
console.log(`\n=== S7-T2 Responsive Audit (patrons comuns de overflow <640px) ===\n`);
const grouped = { high: [], medium: [], low: [] };
for (const f of findings) grouped[f.severity].push(f);

console.log(`Total findings: ${findings.length} (high: ${grouped.high.length}, med: ${grouped.medium.length}, low: ${grouped.low.length})\n`);

for (const sev of ['high', 'medium', 'low']) {
  if (grouped[sev].length === 0) continue;
  console.log(`─── ${sev.toUpperCase()} ───`);
  for (const f of grouped[sev].slice(0, 30)) {
    console.log(`  [${f.type}] ${f.detail}`);
    console.log(`    @ ${f.where}`);
  }
  if (grouped[sev].length > 30) console.log(`  ... (${grouped[sev].length - 30} més)`);
  console.log('');
}

if (grouped.high.length === 0) {
  console.log('✅ Cap finding HIGH — codi responsive OK a primera vista.');
} else {
  console.log(`⚠️  ${grouped.high.length} findings HIGH — revisió manual recomanada als fitxers indicats.`);
}
