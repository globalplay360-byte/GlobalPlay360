import type { User } from '@/types';

const COMMON_FIELDS: (keyof User)[] = [
  'displayName',
  'photoURL',
  'bio',
  'country',
  'city',
  'phone',
  'instagram',
];

const ROLE_FIELDS: Record<User['role'], (keyof User)[]> = {
  player: ['sport', 'currentClub', 'dateOfBirth', 'height', 'weight', 'position'],
  coach: ['experienceYears', 'specialization', 'genderPreference', 'categoryPreference'],
  club: ['foundedYear', 'website', 'venueName', 'venueCapacity'],
  admin: [],
};

/**
 * Calcula el percentatge de completesa del perfil de l'usuari basat en
 * els camps rellevants per al seu rol. Retorna un enter 0-100.
 */
export function getProfileStrength(user: User | null): number {
  if (!user) return 0;

  const fields = [...COMMON_FIELDS, ...(ROLE_FIELDS[user.role] ?? [])];
  if (fields.length === 0) return 100;

  const filled = fields.filter((f) => {
    const v = user[f];
    return v !== undefined && v !== null && v !== '';
  }).length;

  return Math.round((filled / fields.length) * 100);
}
