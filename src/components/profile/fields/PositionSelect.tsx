import { useTranslation } from 'react-i18next';
import type { Sport } from '@/types';
import { Field, Select } from './FormControls';
import { POSITIONS_BY_SPORT, positionI18nKey } from '@/constants/sports';

interface PositionSelectProps {
  sport: Sport;
  value: string | undefined;
  onChange: (position: string | undefined) => void;
  disabled?: boolean;
  hint?: string;
}

export function PositionSelect({ sport, value, onChange, disabled, hint }: PositionSelectProps) {
  const { t } = useTranslation();
  const positions = POSITIONS_BY_SPORT[sport] ?? [];

  return (
    <Field label={t('profileEdit.fields.position', 'Posició')} hint={hint}>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={disabled}
      >
        <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
        {positions.map((p) => (
          <option key={p} value={p}>
            {t(positionI18nKey(p), p)}
          </option>
        ))}
      </Select>
    </Field>
  );
}
