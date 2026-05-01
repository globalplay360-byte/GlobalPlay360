import type { Sport } from '@/types';

/**
 * Llista canònica d'esports. La key tipada `Sport` es valida en compile-time
 * via `satisfies`, així si s'afegeix un esport al tipus aquí saltarà error
 * fins que s'inclogui (i viceversa).
 */
export const SPORTS: readonly Sport[] = [
  'football',
  'basketball',
  'futsal',
  'volleyball',
  'handball',
  'waterpolo',
  'tennis',
  'rugby',
  'american_football',
  'hockey',
  'other',
] as const satisfies readonly Sport[];

/**
 * Posicions disponibles per esport. Els valors són els labels en català —
 * els components els passen a i18n via `sports.positions.<slug>` amb fallback
 * al label original.
 */
export const POSITIONS_BY_SPORT: Partial<Record<Sport, readonly string[]>> = {
  football: ['Porter', 'Defensa', 'Lateral', 'Migcampista', 'Extrem', 'Davanter'],
  basketball: ['Base (PG)', 'Escorta (SG)', 'Aler (SF)', 'Ala-Pivot (PF)', 'Pivot (C)'],
  futsal: ['Porter', 'Tanca', 'Ala', 'Pivot', 'Universal'],
  volleyball: ['Col·locador', 'Oposat', 'Receptor', 'Central', 'Líbero'],
  handball: ['Porter', 'Central', 'Lateral', 'Extrem', 'Pivot'],
  waterpolo: ['Porter', 'Defensa', 'Boia', 'Extrem', 'Central'],
  hockey: ['Porter', 'Defensa', 'Migcampista', 'Davanter'],
  rugby: [
    'Pilar',
    'Talonador',
    'Segona línia',
    'Flanker',
    'Número 8',
    'Mig de melé',
    'Obertura',
    'Centre',
    'Ala',
    'Zaguer',
  ],
  american_football: [
    'Quarterback (QB)',
    'Running Back (RB)',
    'Wide Receiver (WR)',
    'Tight End (TE)',
    'Offensive Line (OL)',
    'Defensive Line (DL)',
    'Linebacker (LB)',
    'Cornerback (CB)',
    'Safety (S)',
    'Kicker / Punter',
  ],
};

/** Tipus laxe compatible amb la `t` de `useTranslation()` (TFunction). */
type Translator = (key: string, defaultValue: string) => unknown;

/**
 * Builder per als selectors d'esport. Retorna `{ value, label }[]` ja
 * traduïts via i18n, evitant que cada formulari es construeixi la llista
 * a mà i derivi a versions desincronitzades.
 */
export function buildSportOptions(t: Translator): { value: Sport; label: string }[] {
  return SPORTS.map((value) => ({ value, label: String(t(`sports.${value}`, value)) }));
}

/** Slug usat com a clau i18n per a una posició (ex: "Ala-Pivot (PF)" → "ala-pivot(pf)"). */
export function positionI18nKey(position: string): string {
  return `sports.positions.${position.toLowerCase().replace(/ /g, '')}`;
}
