import type { TFunction } from 'i18next';
import type {
  Sport,
  UserRole,
  PlanType,
  SubscriptionStatus,
  Handedness,
  StickHand,
  BackhandType,
} from '@/types';

type Gender = 'male' | 'female' | 'mixed';
type ContractType = 'pro' | 'semi-pro' | 'amateur' | 'academy' | 'trial';
type OpportunityStatus = 'open' | 'closed';
type ApplicationStatus = 'submitted' | 'in_review' | 'accepted' | 'rejected';

// ─────────────────────────────────────────────────────────────
// POSITIONS
//
// `value` is the string stored in Firestore (legacy Catalan data).
// Do NOT change existing `value`s without a data migration.
// `key` is the stable slug used to build the i18n key path.
// ─────────────────────────────────────────────────────────────

export interface PositionEntry {
  value: string;
  key: string;
}

export const POSITIONS_BY_SPORT: Record<Exclude<Sport, 'tennis' | 'other'>, PositionEntry[]> = {
  football: [
    { value: 'Porter', key: 'goalkeeper' },
    { value: 'Defensa', key: 'defender' },
    { value: 'Lateral', key: 'fullback' },
    { value: 'Migcampista', key: 'midfielder' },
    { value: 'Extrem', key: 'winger' },
    { value: 'Davanter', key: 'forward' },
  ],
  basketball: [
    { value: 'Base (PG)', key: 'point_guard' },
    { value: 'Escorta (SG)', key: 'shooting_guard' },
    { value: 'Aler (SF)', key: 'small_forward' },
    { value: 'Ala-Pivot (PF)', key: 'power_forward' },
    { value: 'Pivot (C)', key: 'center' },
  ],
  futsal: [
    { value: 'Porter', key: 'goalkeeper' },
    { value: 'Tanca', key: 'defender' },
    { value: 'Ala', key: 'winger' },
    { value: 'Pivot', key: 'pivot' },
    { value: 'Universal', key: 'universal' },
  ],
  volleyball: [
    { value: 'Col·locador', key: 'setter' },
    { value: 'Oposat', key: 'opposite' },
    { value: 'Receptor', key: 'outside_hitter' },
    { value: 'Central', key: 'middle_blocker' },
    { value: 'Líbero', key: 'libero' },
  ],
  handball: [
    { value: 'Porter', key: 'goalkeeper' },
    { value: 'Central', key: 'center' },
    { value: 'Lateral', key: 'wingback' },
    { value: 'Extrem', key: 'wing' },
    { value: 'Pivot', key: 'pivot' },
  ],
  waterpolo: [
    { value: 'Porter', key: 'goalkeeper' },
    { value: 'Defensa', key: 'defender' },
    { value: 'Boia', key: 'hole_set' },
    { value: 'Extrem', key: 'wing' },
    { value: 'Central', key: 'center' },
  ],
  rugby: [
    { value: 'Pilar', key: 'prop' },
    { value: 'Talonador', key: 'hooker' },
    { value: 'Segona línia', key: 'lock' },
    { value: 'Flanker', key: 'flanker' },
    { value: 'Número 8', key: 'number_eight' },
    { value: 'Mig de melé', key: 'scrum_half' },
    { value: 'Obertura', key: 'fly_half' },
    { value: 'Centre', key: 'centre' },
    { value: 'Ala', key: 'wing' },
    { value: 'Zaguer', key: 'fullback' },
  ],
  american_football: [
    { value: 'Quarterback (QB)', key: 'quarterback' },
    { value: 'Running Back (RB)', key: 'running_back' },
    { value: 'Wide Receiver (WR)', key: 'wide_receiver' },
    { value: 'Tight End (TE)', key: 'tight_end' },
    { value: 'Offensive Line (OL)', key: 'offensive_line' },
    { value: 'Defensive Line (DL)', key: 'defensive_line' },
    { value: 'Linebacker (LB)', key: 'linebacker' },
    { value: 'Cornerback (CB)', key: 'cornerback' },
    { value: 'Safety (S)', key: 'safety' },
    { value: 'Kicker / Punter', key: 'kicker_punter' },
  ],
  hockey: [
    { value: 'Porter', key: 'goalkeeper' },
    { value: 'Defensa', key: 'defender' },
    { value: 'Migcampista', key: 'midfielder' },
    { value: 'Davanter', key: 'forward' },
  ],
};

// ─────────────────────────────────────────────────────────────
// POSITION HELPERS
// ─────────────────────────────────────────────────────────────

export function positionLabel(sport: Sport | undefined, storedValue: string | undefined, t: TFunction): string {
  if (!sport || !storedValue) return storedValue ?? '';
  if (sport === 'tennis' || sport === 'other') return storedValue;
  const entries = POSITIONS_BY_SPORT[sport];
  const match = entries?.find((p) => p.value === storedValue);
  if (!match) return storedValue;
  return t(`enums.position.${sport}.${match.key}`, storedValue);
}

export function getPositionsForSport(
  sport: Sport | undefined,
  t: TFunction,
): { value: string; label: string }[] {
  if (!sport || sport === 'tennis' || sport === 'other') return [];
  const entries = POSITIONS_BY_SPORT[sport] || [];
  return entries.map((p) => ({
    value: p.value,
    label: t(`enums.position.${sport}.${p.key}`, p.value),
  }));
}

// ─────────────────────────────────────────────────────────────
// ENUM LABEL HELPERS
// Values are already slug-like, so the key path is direct.
// ─────────────────────────────────────────────────────────────

export function sportLabel(sport: Sport | undefined, t: TFunction): string {
  if (!sport) return '';
  return t(`enums.sport.${sport}`, sport);
}

export function roleLabel(role: UserRole | undefined, t: TFunction): string {
  if (!role) return '';
  return t(`enums.role.${role}`, role);
}

export function genderLabel(gender: Gender | undefined, t: TFunction): string {
  if (!gender) return '';
  return t(`enums.gender.${gender}`, gender);
}

export function contractTypeLabel(contract: ContractType | undefined, t: TFunction): string {
  if (!contract) return '';
  return t(`enums.contractType.${contract}`, contract);
}

export function handednessLabel(h: Handedness | undefined, t: TFunction): string {
  if (!h) return '';
  return t(`enums.handedness.${h}`, h);
}

export function stickHandLabel(h: StickHand | undefined, t: TFunction): string {
  if (!h) return '';
  return t(`enums.stickHand.${h}`, h);
}

export function backhandTypeLabel(b: BackhandType | undefined, t: TFunction): string {
  if (!b) return '';
  return t(`enums.backhandType.${b}`, b);
}

export function opportunityStatusLabel(status: OpportunityStatus | undefined, t: TFunction): string {
  if (!status) return '';
  return t(`enums.opportunityStatus.${status}`, status);
}

export function applicationStatusLabel(status: ApplicationStatus | undefined, t: TFunction): string {
  if (!status) return '';
  return t(`enums.applicationStatus.${status}`, status);
}

export function planLabel(plan: PlanType | undefined, t: TFunction): string {
  if (!plan) return '';
  return t(`enums.plan.${plan}`, plan);
}

export function subscriptionStatusLabel(status: SubscriptionStatus | undefined, t: TFunction): string {
  if (!status) return '';
  return t(`enums.subscriptionStatus.${status}`, status);
}

// ─────────────────────────────────────────────────────────────
// OPTION BUILDERS FOR SELECT DROPDOWNS
// ─────────────────────────────────────────────────────────────

const SPORT_VALUES: Sport[] = [
  'football', 'basketball', 'futsal', 'volleyball', 'handball',
  'waterpolo', 'tennis', 'rugby', 'american_football', 'hockey', 'other',
];

export function getSportOptions(t: TFunction): { value: Sport; label: string }[] {
  return SPORT_VALUES.map((value) => ({ value, label: sportLabel(value, t) }));
}

export function getHandednessOptions(t: TFunction): { value: Handedness; label: string }[] {
  return (['right', 'left', 'both'] as Handedness[]).map((v) => ({
    value: v,
    label: handednessLabel(v, t),
  }));
}

export function getStickHandOptions(t: TFunction): { value: StickHand; label: string }[] {
  return (['right', 'left'] as StickHand[]).map((v) => ({
    value: v,
    label: stickHandLabel(v, t),
  }));
}

export function getBackhandTypeOptions(t: TFunction): { value: BackhandType; label: string }[] {
  return (['one-hand', 'two-hand'] as BackhandType[]).map((v) => ({
    value: v,
    label: backhandTypeLabel(v, t),
  }));
}
