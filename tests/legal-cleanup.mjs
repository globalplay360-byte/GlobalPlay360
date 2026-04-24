// One-shot: substitueix els placeholders [PENDENT_*] dins els HTML de legal
// per un marcador visual uniforme perquè cap mailto clicable apunti a destí
// invàlid i cap text "lletjo" quedi al render. Idempotent.
import { readFileSync, writeFileSync } from 'fs';

const FILES = [
  'src/content/legal/privacy.content.ts',
  'src/content/legal/terms.content.ts',
  'src/content/legal/cookies.content.ts',
];

// Marcador visual multiidioma per rol dins la pàgina.
// Format: <em style="color:#6B7280;font-style:italic">(pendent de configuració)</em>
// Farem servir wrapper `[pendent de configuració]` en cada idioma via regex.
const PENDING_CA = '<em style="color:#6B7280">[pendent de configuració]</em>';
const PENDING_ES = '<em style="color:#6B7280">[pendiente de configuración]</em>';
const PENDING_EN = '<em style="color:#6B7280">[pending configuration]</em>';

let totalReplacements = 0;

for (const file of FILES) {
  let content = readFileSync(file, 'utf8');
  const before = content;

  // Heurística: tria marcador segons locale marker a les seccions.
  // Els .content.ts estan estructurats com { ca: [...], es: [...], en: [...] }.
  // Substituïm sobre l'objecte sencer però fem les substitucions tenint en
  // compte el context lingüístic per paraules com "Correu" / "Correo" / "Email".

  // 1. mailto clicables: <a href="mailto:[PENDENT_*]">[PENDENT_*]</a>
  //    Substitueix pel marcador segons idioma detectat al voltant.
  const mailtoRe = /<a\s+href="mailto:\[PENDENT_[A-Z_]+\]">\s*\[PENDENT_[A-Z_]+\]\s*<\/a>/g;
  content = content.replace(mailtoRe, (match, offset) => {
    const around = content.slice(Math.max(0, offset - 400), offset + 400);
    if (/\b(email|owner|company|registered|data protection|exercise)\b/i.test(around) && !/Correu/i.test(around) && !/Correo/i.test(around))
      return PENDING_EN;
    if (/Correo|España|Responsable|Domicilio/i.test(around)) return PENDING_ES;
    return PENDING_CA;
  });

  // 2. Placeholders text-pla: [PENDENT_RESPONSABLE], [PENDENT_NOM_LEGAL],
  //    [PENDENT_NIF], [PENDENT_DOMICILI], [PENDENT_DENOMINACIO], etc.
  const textRe = /\[PENDENT_[A-Z_]+\]/g;
  content = content.replace(textRe, (match, offset) => {
    const around = content.slice(Math.max(0, offset - 400), offset + 400);
    if (/\b(owner|company|registered|email|address|tax)\b/i.test(around) && !/Correu/i.test(around) && !/Correo|Domicilio|Responsable/i.test(around))
      return PENDING_EN;
    if (/Correo|España|Responsable|Domicilio/i.test(around)) return PENDING_ES;
    return PENDING_CA;
  });

  if (content !== before) {
    // Compta reemplaçaments aproximat
    const approxDiff = (before.match(/\[PENDENT_[A-Z_]+\]/g) || []).length;
    totalReplacements += approxDiff;
    writeFileSync(file, content, 'utf8');
    console.log(`✓ ${file}: ${approxDiff} placeholders reemplaçats`);
  } else {
    console.log(`  ${file}: cap canvi (ja net)`);
  }
}

console.log(`\nTotal: ${totalReplacements} placeholders reemplaçats.`);
