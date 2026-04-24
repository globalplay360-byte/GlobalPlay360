// Auditoria empty states S7-T5: busca pàgines amb llistats que podrien
// renderitzar ZERO elements sense EmptyState, o interpolacions que poden
// mostrar "undefined" a l'UI.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = 'src/pages';
const findings = [];

function walk(dir, fn) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, fn);
    else if (/\.tsx$/.test(entry)) fn(full);
  }
}

walk(SRC, (file) => {
  const content = readFileSync(file, 'utf8');

  // 1. Renderitza `.map(...)` sense fallback EmptyState ni `.length` check
  // Heurística: pages amb .map() han de tenir o EmptyState o length check a sobre
  const hasMap = /\.map\(/.test(content);
  const hasEmpty = /<EmptyState\b/.test(content) || /length\s*===\s*0/.test(content) || /length\s*>\s*0/.test(content);
  if (hasMap && !hasEmpty && !file.includes('/components/')) {
    findings.push({
      severity: 'high',
      type: 'map sense fallback empty',
      where: file,
      detail: 'pàgina amb .map() però cap EmptyState ni length check',
    });
  }

  // 2. Template literals o interpolacions que podrien imprimir "undefined" literal
  //    p.e.: {`${user.height}`} quan user.height és undefined → "undefined cm"
  const undefRisk = content.match(/\{`[^`]*\$\{[a-zA-Z_][\w.]*\}[^`]*`\}/g) || [];
  for (const expr of undefRisk) {
    // Si no té guard ?? '' o `||` fallback, pot renderitzar "undefined"
    if (/\?\?|\|\||\?\./.test(expr)) continue;
    // Ignora casos segurs: 'className' templates
    if (expr.includes('className')) continue;
    findings.push({
      severity: 'medium',
      type: 'template literal sense fallback',
      where: file,
      detail: expr.slice(0, 100),
    });
  }

  // 3. Cerca `{user.foo}` seguit de text sense guard — per exemple "{user.height} cm"
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Match {object.prop} que no té || fallback ni ?? ni ? . al mateix match
    const interp = line.match(/\{(\w+)\.(\w+)\}\s*(cm|kg|€|\$|%|anys|años|years)/g);
    if (!interp) return;
    for (const m of interp) {
      // Busca al mateix element pare si té guard condicional
      // Heurística simple: si les 2 línies anteriors tenen && o ?
      const prev = lines.slice(Math.max(0, idx - 2), idx).join(' ');
      if (/&&/.test(prev) || /\?/.test(prev) || /\|\|/.test(line) || /\?\./.test(line)) continue;
      findings.push({
        severity: 'medium',
        type: 'unitat junt a var sense guard',
        where: `${file}:${idx + 1}`,
        detail: m,
      });
    }
  });
});

console.log(`\n=== S7-T5 Empty State Audit ===\n`);
console.log(`Total findings: ${findings.length}`);
console.log(`  HIGH:   ${findings.filter((f) => f.severity === 'high').length}`);
console.log(`  MEDIUM: ${findings.filter((f) => f.severity === 'medium').length}\n`);

for (const sev of ['high', 'medium']) {
  const items = findings.filter((f) => f.severity === sev);
  if (items.length === 0) continue;
  console.log(`─── ${sev.toUpperCase()} ───`);
  for (const f of items.slice(0, 20)) {
    console.log(`  [${f.type}] ${f.detail}`);
    console.log(`    @ ${f.where}`);
  }
  console.log('');
}

if (findings.filter((f) => f.severity === 'high').length === 0) {
  console.log('✅ Cap finding HIGH (totes les pàgines amb llistat tenen EmptyState o length check).');
}
