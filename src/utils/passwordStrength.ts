export type PasswordStrengthLevel = 'empty' | 'veryWeak' | 'weak' | 'good' | 'strong';

export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
}

const SPECIAL_RE = /[0-9!@#$%^&*(),.?":{}|<>]/;
const UPPER_RE = /[A-Z]/;
const LOWER_RE = /[a-z]/;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, level: 'empty' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (UPPER_RE.test(password)) score += 1;
  if (LOWER_RE.test(password)) score += 1;
  if (SPECIAL_RE.test(password)) score += 1;

  if (score <= 1) return { score, level: 'veryWeak' };
  if (score === 2) return { score, level: 'weak' };
  if (score === 3) return { score, level: 'good' };
  return { score, level: 'strong' };
}

export const STRENGTH_BAR: Record<PasswordStrengthLevel, { bar: string; width: string; text: string }> = {
  empty: { bar: 'bg-transparent', width: 'w-0', text: 'text-transparent' },
  veryWeak: { bar: 'bg-red-500', width: 'w-1/4', text: 'text-red-500' },
  weak: { bar: 'bg-orange-500', width: 'w-2/4', text: 'text-orange-500' },
  good: { bar: 'bg-yellow-400', width: 'w-3/4', text: 'text-yellow-400' },
  strong: { bar: 'bg-green-500', width: 'w-full', text: 'text-green-500' },
};
