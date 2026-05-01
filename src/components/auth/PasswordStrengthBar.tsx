import { useTranslation } from 'react-i18next';
import { getPasswordStrength, STRENGTH_BAR } from '@/utils/passwordStrength';

interface PasswordStrengthBarProps {
  password: string;
}

const LEVEL_LABEL_KEY = {
  veryWeak: 'passwordStrength.veryWeak',
  weak: 'passwordStrength.weak',
  good: 'passwordStrength.good',
  strong: 'passwordStrength.strong',
} as const;

const LEVEL_LABEL_FALLBACK = {
  veryWeak: 'Molt feble',
  weak: 'Feble',
  good: 'Bona',
  strong: 'Forta',
} as const;

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { t } = useTranslation();
  if (!password) return null;

  const { level } = getPasswordStrength(password);
  if (level === 'empty') return null;

  const styles = STRENGTH_BAR[level];
  const label = t(LEVEL_LABEL_KEY[level], LEVEL_LABEL_FALLBACK[level]);

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#9CA3AF]">
          {t('passwordStrength.label', 'Nivell de seguretat')}
        </span>
        <span className={`text-xs font-semibold ${styles.text}`}>{label}</span>
      </div>
      <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
        <div className={`h-full transition-all duration-300 ease-in-out ${styles.bar} ${styles.width}`} />
      </div>
    </div>
  );
}
